/**
 * @hexa/adapter-mongoose
 * Mongoose database adapter for Hexa Framework (MongoDB)
 * by lutfian.rhdn
 */

import mongoose, { Connection, Model, Document, Schema, FilterQuery } from 'mongoose';
import {
    IDatabaseAdapter,
    DatabaseAdapterConfig,
    IRepository,
    IBaseEntity,
    PaginationResult,
    QueryOptions,
    SearchConfig,
    FilterObject,
} from '@hexa-framework/common';

// ============================================
// Mongoose Adapter
// ============================================

export interface MongooseAdapterConfig extends DatabaseAdapterConfig {
    uri?: string;
}

/**
 * Mongoose Database Adapter
 * Implements IDatabaseAdapter for Mongoose/MongoDB
 */
export class MongooseAdapter implements IDatabaseAdapter<Connection> {
    readonly name = 'mongoose';
    private connection: Connection | null = null;
    private connected = false;
    private uri: string;

    constructor(config: MongooseAdapterConfig) {
        this.uri = config.uri || config.url || 'mongodb://localhost:27017/hexa';
    }

    async connect(): Promise<void> {
        if (this.connected) return;
        await mongoose.connect(this.uri);
        this.connection = mongoose.connection;
        this.connected = true;
    }

    async disconnect(): Promise<void> {
        if (!this.connected) return;
        await mongoose.disconnect();
        this.connection = null;
        this.connected = false;
    }

    getClient(): Connection {
        if (!this.connection) {
            throw new Error('Mongoose not connected. Call connect() first.');
        }
        return this.connection;
    }

    isConnected(): boolean {
        return this.connected && mongoose.connection.readyState === 1;
    }
}

// ============================================
// Base Mongoose Repository
// ============================================

export interface MongooseDocument extends Document, IBaseEntity {
    _id: mongoose.Types.ObjectId;
}

/**
 * Base Mongoose Repository
 * Provides common CRUD operations for Mongoose models
 */
export abstract class BaseMongooseRepository<T extends MongooseDocument>
    implements IRepository<T> {
    protected model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async getById(id: string | number): Promise<T | null> {
        return this.model.findOne({
            _id: id,
            isActive: true,
            deletedAt: null,
        } as FilterQuery<T>).exec();
    }

    async getAll(options?: QueryOptions): Promise<PaginationResult<T>> {
        const page = options?.pagination?.page || 1;
        const limit = options?.pagination?.limit || 10;
        const skip = (page - 1) * limit;

        const where = this.buildWhereClause(options?.search, options?.filters);
        const sort = options?.orderBy || { createdAt: -1 };

        const [data, total] = await Promise.all([
            this.model.find(where).sort(sort as any).skip(skip).limit(limit).exec(),
            this.model.countDocuments(where).exec(),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
        const doc = new this.model({
            ...item,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return doc.save();
    }

    async update(id: string | number, item: Partial<T>): Promise<T> {
        const updated = await this.model.findByIdAndUpdate(
            id,
            {
                ...item,
                updatedAt: new Date(),
            },
            { new: true }
        ).exec();

        if (!updated) {
            throw new Error(`Document with id ${id} not found`);
        }
        return updated;
    }

    async softDelete(id: string | number): Promise<void> {
        await this.model.findByIdAndUpdate(id, {
            isActive: false,
            deletedAt: new Date(),
            updatedAt: new Date(),
        }).exec();
    }

    async hardDelete(id: string | number): Promise<void> {
        await this.model.findByIdAndDelete(id).exec();
    }

    async count(filters?: FilterObject): Promise<number> {
        const where = this.buildWhereClause(undefined, filters);
        return this.model.countDocuments(where).exec();
    }

    async exists(id: string | number): Promise<boolean> {
        const count = await this.model.countDocuments({
            _id: id,
            isActive: true,
            deletedAt: null,
        } as FilterQuery<T>).exec();
        return count > 0;
    }

    protected buildWhereClause(
        search?: SearchConfig[],
        filters?: FilterObject
    ): FilterQuery<T> {
        const where: Record<string, any> = {
            isActive: true,
            deletedAt: null,
        };

        if (filters) {
            for (const [key, value] of Object.entries(filters)) {
                if (value !== undefined && value !== null && value !== '') {
                    where[key] = value;
                }
            }
        }

        if (search && search.length > 0) {
            where.$or = search.map((s) => ({
                [s.field]: { $regex: s.value, $options: 'i' },
            }));
        }

        return where as FilterQuery<T>;
    }
}

// ============================================
// Schema Factory
// ============================================

/**
 * Create a base schema with common fields
 */
export function createBaseSchema<T>(fields: Record<string, any>): Schema<T> {
    return new Schema<T>(
        {
            ...fields,
            isActive: { type: Boolean, default: true },
            deletedAt: { type: Date, default: null },
        },
        {
            timestamps: true,
        }
    );
}

// ============================================
// Factory Functions
// ============================================

/**
 * Create a Mongoose adapter instance
 */
export function createMongooseAdapter(config: MongooseAdapterConfig): MongooseAdapter {
    return new MongooseAdapter(config);
}

// Re-export types
export { mongoose, Schema, Model, Document } from 'mongoose';
