/**
 * @hexa/adapter-typeorm
 * TypeORM database adapter for Hexa Framework
 * by lutfian.rhdn
 */

import 'reflect-metadata';
import { DataSource, Repository as TypeORMRepository, EntityTarget, ObjectLiteral, FindOptionsWhere } from 'typeorm';
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
// TypeORM Adapter
// ============================================

export interface TypeORMAdapterConfig extends DatabaseAdapterConfig {
    type: 'postgres' | 'mysql' | 'sqlite' | 'mariadb' | 'mssql';
    entities?: string[];
    synchronize?: boolean;
    logging?: boolean;
}

/**
 * TypeORM Database Adapter
 * Implements IDatabaseAdapter for TypeORM
 */
export class TypeORMAdapter implements IDatabaseAdapter<DataSource> {
    readonly name = 'typeorm';
    private dataSource: DataSource;
    private connected = false;

    constructor(config: TypeORMAdapterConfig) {
        this.dataSource = new DataSource({
            type: config.type,
            host: config.host,
            port: config.port,
            username: config.username,
            password: config.password,
            database: config.database,
            entities: config.entities || ['src/**/entities/*.ts'],
            synchronize: config.synchronize ?? false,
            logging: config.logging ?? false,
        } as any);
    }

    async connect(): Promise<void> {
        if (this.connected) return;
        await this.dataSource.initialize();
        this.connected = true;
    }

    async disconnect(): Promise<void> {
        if (!this.connected) return;
        await this.dataSource.destroy();
        this.connected = false;
    }

    getClient(): DataSource {
        return this.dataSource;
    }

    isConnected(): boolean {
        return this.connected && this.dataSource.isInitialized;
    }

    /**
     * Get TypeORM repository for an entity
     */
    getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): TypeORMRepository<T> {
        return this.dataSource.getRepository(entity);
    }
}

// ============================================
// Base TypeORM Repository
// ============================================

/**
 * Base TypeORM Repository
 * Provides common CRUD operations for TypeORM entities
 */
export abstract class BaseTypeORMRepository<T extends IBaseEntity & ObjectLiteral>
    implements IRepository<T> {
    protected repository: TypeORMRepository<T>;

    constructor(dataSource: DataSource, entity: EntityTarget<T>) {
        this.repository = dataSource.getRepository(entity);
    }

    async getById(id: string | number): Promise<T | null> {
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        return this.repository.findOne({
            where: {
                id: numericId,
                isActive: true,
                deletedAt: null,
            } as unknown as FindOptionsWhere<T>,
        });
    }

    async getAll(options?: QueryOptions): Promise<PaginationResult<T>> {
        const page = options?.pagination?.page || 1;
        const limit = options?.pagination?.limit || 10;
        const skip = (page - 1) * limit;

        const where = this.buildWhereClause(options?.search, options?.filters);
        const order = options?.orderBy || { createdAt: 'DESC' };

        const [data, total] = await this.repository.findAndCount({
            where: where as FindOptionsWhere<T>,
            order: order as any,
            skip,
            take: limit,
        });

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
        const entity = this.repository.create({
            ...item,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as unknown as T);
        return this.repository.save(entity);
    }

    async update(id: string | number, item: Partial<T>): Promise<T> {
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        await this.repository.update(numericId, {
            ...item,
            updatedAt: new Date(),
        } as unknown as T);
        return this.getById(numericId) as Promise<T>;
    }

    async softDelete(id: string | number): Promise<void> {
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        await this.repository.update(numericId, {
            isActive: false,
            deletedAt: new Date(),
            updatedAt: new Date(),
        } as unknown as T);
    }

    async hardDelete(id: string | number): Promise<void> {
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        await this.repository.delete(numericId);
    }

    async count(filters?: FilterObject): Promise<number> {
        const where = this.buildWhereClause(undefined, filters);
        return this.repository.count({ where: where as FindOptionsWhere<T> });
    }

    async exists(id: string | number): Promise<boolean> {
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        const count = await this.repository.count({
            where: { id: numericId, isActive: true, deletedAt: null } as unknown as FindOptionsWhere<T>,
        });
        return count > 0;
    }

    protected buildWhereClause(
        search?: SearchConfig[],
        filters?: FilterObject
    ): Record<string, any> {
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

        // Note: TypeORM search is more complex, this is simplified
        // For full-text search, consider using QueryBuilder

        return where;
    }
}

// ============================================
// Factory Functions
// ============================================

/**
 * Create a TypeORM adapter instance
 */
export function createTypeORMAdapter(config: TypeORMAdapterConfig): TypeORMAdapter {
    return new TypeORMAdapter(config);
}

// Re-export types
export { DataSource, Repository as TypeORMRepository } from 'typeorm';
