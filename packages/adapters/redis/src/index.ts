/**
 * @hexa/adapter-redis
 * Redis cache adapter for Hexa Framework
 * by lutfian.rhdn
 */

import { createClient, RedisClientType, RedisClientOptions } from 'redis';
import { ICache, IDatabaseAdapter, DatabaseAdapterConfig } from '@hexa/common';

// ============================================
// Redis Adapter Config
// ============================================

export interface RedisAdapterConfig extends DatabaseAdapterConfig {
    url?: string;
    password?: string;
    db?: number;
    keyPrefix?: string;
}

// ============================================
// Redis Adapter
// ============================================

/**
 * Redis Adapter
 * Implements IDatabaseAdapter for Redis
 */
export class RedisAdapter implements IDatabaseAdapter<RedisClientType> {
    readonly name = 'redis';
    private client: RedisClientType;
    private connected = false;
    private keyPrefix: string;

    constructor(config?: RedisAdapterConfig) {
        const clientOptions: RedisClientOptions = {};

        if (config?.url) {
            clientOptions.url = config.url;
        } else {
            clientOptions.socket = {
                host: config?.host || 'localhost',
                port: config?.port || 6379,
            };
        }

        if (config?.password) {
            clientOptions.password = config.password;
        }

        if (config?.db !== undefined) {
            clientOptions.database = config.db;
        }

        this.client = createClient(clientOptions) as RedisClientType;
        this.keyPrefix = config?.keyPrefix || 'hexa:';

        // Handle errors
        this.client.on('error', (err) => {
            console.error('[Redis] Error:', err);
        });
    }

    async connect(): Promise<void> {
        if (this.connected) return;
        await this.client.connect();
        this.connected = true;
    }

    async disconnect(): Promise<void> {
        if (!this.connected) return;
        await this.client.quit();
        this.connected = false;
    }

    getClient(): RedisClientType {
        return this.client;
    }

    isConnected(): boolean {
        return this.connected && this.client.isReady;
    }

    getKeyPrefix(): string {
        return this.keyPrefix;
    }
}

// ============================================
// Redis Cache Implementation
// ============================================

/**
 * Redis Cache
 * Implements ICache interface using Redis
 */
export class RedisCache implements ICache {
    private client: RedisClientType;
    private prefix: string;

    constructor(adapter: RedisAdapter) {
        this.client = adapter.getClient();
        this.prefix = adapter.getKeyPrefix();
    }

    private getKey(key: string): string {
        return `${this.prefix}${key}`;
    }

    async get<T>(key: string): Promise<T | null> {
        const value = await this.client.get(this.getKey(key));
        if (!value) return null;

        try {
            return JSON.parse(value) as T;
        } catch {
            return value as unknown as T;
        }
    }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);

        if (ttlSeconds) {
            await this.client.setEx(this.getKey(key), ttlSeconds, serialized);
        } else {
            await this.client.set(this.getKey(key), serialized);
        }
    }

    async delete(key: string): Promise<void> {
        await this.client.del(this.getKey(key));
    }

    async clear(): Promise<void> {
        const keys = await this.client.keys(`${this.prefix}*`);
        if (keys.length > 0) {
            await this.client.del(keys);
        }
    }

    async exists(key: string): Promise<boolean> {
        const result = await this.client.exists(this.getKey(key));
        return result === 1;
    }

    /**
     * Get TTL of a key in seconds
     */
    async ttl(key: string): Promise<number> {
        return this.client.ttl(this.getKey(key));
    }

    /**
     * Set expiration on existing key
     */
    async expire(key: string, ttlSeconds: number): Promise<boolean> {
        return this.client.expire(this.getKey(key), ttlSeconds);
    }

    /**
     * Increment a numeric value
     */
    async incr(key: string): Promise<number> {
        return this.client.incr(this.getKey(key));
    }

    /**
     * Decrement a numeric value
     */
    async decr(key: string): Promise<number> {
        return this.client.decr(this.getKey(key));
    }
}

// ============================================
// Session Store (for Express Session)
// ============================================

export interface SessionData {
    [key: string]: any;
}

/**
 * Redis Session Store
 * Can be used with express-session
 */
export class RedisSessionStore {
    private cache: RedisCache;
    private prefix: string;
    private ttlSeconds: number;

    constructor(adapter: RedisAdapter, options?: { prefix?: string; ttlSeconds?: number }) {
        this.cache = new RedisCache(adapter);
        this.prefix = options?.prefix || 'session:';
        this.ttlSeconds = options?.ttlSeconds || 86400; // 24 hours default
    }

    async get(sessionId: string): Promise<SessionData | null> {
        return this.cache.get<SessionData>(`${this.prefix}${sessionId}`);
    }

    async set(sessionId: string, data: SessionData, ttl?: number): Promise<void> {
        await this.cache.set(`${this.prefix}${sessionId}`, data, ttl || this.ttlSeconds);
    }

    async destroy(sessionId: string): Promise<void> {
        await this.cache.delete(`${this.prefix}${sessionId}`);
    }

    async touch(sessionId: string): Promise<void> {
        await this.cache.expire(`${this.prefix}${sessionId}`, this.ttlSeconds);
    }
}

// ============================================
// Factory Functions
// ============================================

/**
 * Create a Redis adapter instance
 */
export function createRedisAdapter(config?: RedisAdapterConfig): RedisAdapter {
    return new RedisAdapter(config);
}

/**
 * Create a Redis cache instance
 */
export function createRedisCache(adapter: RedisAdapter): RedisCache {
    return new RedisCache(adapter);
}

/**
 * Create a Redis session store
 */
export function createSessionStore(
    adapter: RedisAdapter,
    options?: { prefix?: string; ttlSeconds?: number }
): RedisSessionStore {
    return new RedisSessionStore(adapter, options);
}

// Re-export types
export type { RedisClientType } from 'redis';
