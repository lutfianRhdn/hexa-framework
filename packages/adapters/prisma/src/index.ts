/**
 * @hexa/adapter-prisma
 * Prisma database adapter for Hexa Framework
 * by lutfian.rhdn
 */

import { PrismaClient } from '@prisma/client';
import {
    IDatabaseAdapter,
    DatabaseAdapterConfig,
    IRepository,
    IBaseEntity,
    PaginationResult,
    QueryOptions,
    SearchConfig,
    FilterObject,
    OrderByConfig,
} from '@hexa/common';

// ============================================
// Prisma Adapter
// ============================================

export interface PrismaAdapterConfig extends DatabaseAdapterConfig {
    log?: Array<'query' | 'info' | 'warn' | 'error'>;
}

/**
 * Prisma Database Adapter
 * Implements IDatabaseAdapter for Prisma ORM
 */
export class PrismaAdapter implements IDatabaseAdapter<PrismaClient> {
    readonly name = 'prisma';
    private client: PrismaClient;
    private connected = false;

    constructor(config?: PrismaAdapterConfig) {
        this.client = new PrismaClient({
            datasourceUrl: config?.url,
            log: config?.log || ['error'],
        });
    }

    async connect(): Promise<void> {
        if (this.connected) return;
        await this.client.$connect();
        this.connected = true;
    }

    async disconnect(): Promise<void> {
        if (!this.connected) return;
        await this.client.$disconnect();
        this.connected = false;
    }

    getClient(): PrismaClient {
        return this.client;
    }

    isConnected(): boolean {
        return this.connected;
    }
}

// ============================================
// Base Prisma Repository
// ============================================

/**
 * Base Prisma Repository
 * Provides common CRUD operations for Prisma models
 */
export abstract class BasePrismaRepository<T extends IBaseEntity>
    implements IRepository<T> {
    protected prisma: PrismaClient;
    protected abstract modelName: string;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Get the Prisma model delegate
     */
    protected get model(): any {
        return (this.prisma as any)[this.modelName];
    }

    async getById(id: string | number): Promise<T | null> {
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        return this.model.findFirst({
            where: {
                id: numericId,
                isActive: true,
                deletedAt: null,
            },
        });
    }

    async getAll(options?: QueryOptions): Promise<PaginationResult<T>> {
        const page = options?.pagination?.page || 1;
        const limit = options?.pagination?.limit || 10;
        const skip = (page - 1) * limit;

        const where = this.buildWhereClause(
            options?.search,
            options?.filters
        );

        const orderBy = options?.orderBy || { createdAt: 'desc' };

        const [data, total] = await Promise.all([
            this.model.findMany({
                where,
                orderBy,
                skip,
                take: limit,
            }),
            this.model.count({ where }),
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
        return this.model.create({
            data: {
                ...item,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    async update(id: string | number, item: Partial<T>): Promise<T> {
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        return this.model.update({
            where: { id: numericId },
            data: {
                ...item,
                updatedAt: new Date(),
            },
        });
    }

    async softDelete(id: string | number): Promise<void> {
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        await this.model.update({
            where: { id: numericId },
            data: {
                isActive: false,
                deletedAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    async hardDelete(id: string | number): Promise<void> {
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        await this.model.delete({
            where: { id: numericId },
        });
    }

    async createMany(
        items: Array<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<T[]> {
        const now = new Date();
        const dataWithTimestamps = items.map((item) => ({
            ...item,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        }));

        await this.model.createMany({
            data: dataWithTimestamps,
        });

        // Prisma createMany doesn't return created records, so we fetch them
        return this.model.findMany({
            where: { createdAt: now },
            orderBy: { id: 'asc' },
        });
    }

    async count(filters?: FilterObject): Promise<number> {
        const where = this.buildWhereClause(undefined, filters);
        return this.model.count({ where });
    }

    async exists(id: string | number): Promise<boolean> {
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        const count = await this.model.count({
            where: { id: numericId, isActive: true, deletedAt: null },
        });
        return count > 0;
    }

    /**
     * Build Prisma where clause from search and filters
     */
    protected buildWhereClause(
        search?: SearchConfig[],
        filters?: FilterObject
    ): Record<string, any> {
        const where: Record<string, any> = {
            isActive: true,
            deletedAt: null,
        };

        // Apply filters
        if (filters) {
            for (const [key, value] of Object.entries(filters)) {
                if (value !== undefined && value !== null && value !== '') {
                    where[key] = value;
                }
            }
        }

        // Apply search
        if (search && search.length > 0) {
            where.OR = search.map((s) => ({
                [s.field]: {
                    contains: s.value,
                    mode: 'insensitive',
                },
            }));
        }

        return where;
    }
}

// ============================================
// Factory Function
// ============================================

/**
 * Create a Prisma adapter instance
 */
export function createPrismaAdapter(
    config?: PrismaAdapterConfig
): PrismaAdapter {
    return new PrismaAdapter(config);
}

// Re-export types
export type { PrismaClient } from '@prisma/client';
