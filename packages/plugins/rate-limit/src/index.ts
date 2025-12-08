/**
 * @hexa/plugin-rate-limit
 * Rate limiting plugin for Hexa Framework
 * by lutfian.rhdn
 */

import { Request, Response, NextFunction } from 'express';
import { IPlugin, PluginConfig, PluginMetadata, RateLimitOptions } from '@hexa-framework/common';

// ============================================
// Types
// ============================================

export interface RateLimitPluginConfig extends PluginConfig, RateLimitOptions {
    keyGenerator?: (req: Request) => string;
    skip?: (req: Request) => boolean;
    handler?: (req: Request, res: Response) => void;
}

interface RateLimitStore {
    hits: number;
    resetTime: number;
}

// ============================================
// Rate Limit Plugin
// ============================================

/**
 * Rate Limit Plugin
 * In-memory rate limiting for API endpoints
 */
export class RateLimitPlugin implements IPlugin {
    readonly name = 'rate-limit';
    readonly version = '1.0.0';
    private store = new Map<string, RateLimitStore>();

    async init(): Promise<void> {
        // Cleanup expired entries every minute
        setInterval(() => this.cleanup(), 60000);
    }

    async onInit(): Promise<void> { }
    async onReady(): Promise<void> { }
    async onShutdown(): Promise<void> {
        this.store.clear();
    }

    getMetadata(): PluginMetadata {
        return {
            name: this.name,
            version: this.version,
            description: 'In-memory rate limiting middleware',
            author: 'lutfian.rhdn',
        };
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, value] of this.store.entries()) {
            if (now > value.resetTime) {
                this.store.delete(key);
            }
        }
    }

    /**
     * Create rate limit middleware
     */
    createMiddleware(config: RateLimitPluginConfig) {
        const windowMs = config.windowMs || 60000;
        const max = config.max || 100;
        const message = config.message || 'Too many requests, please try again later';
        const keyGenerator = config.keyGenerator || ((req: Request) => req.ip || 'unknown');
        const skip = config.skip || (() => false);

        return (req: Request, res: Response, next: NextFunction): void => {
            if (skip(req)) {
                next();
                return;
            }

            const key = keyGenerator(req);
            const now = Date.now();
            let record = this.store.get(key);

            if (!record || now > record.resetTime) {
                record = { hits: 0, resetTime: now + windowMs };
                this.store.set(key, record);
            }

            record.hits++;

            // Set rate limit headers
            res.setHeader('X-RateLimit-Limit', max);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.hits));
            res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

            if (record.hits > max) {
                if (config.handler) {
                    config.handler(req, res);
                    return;
                }

                res.status(429).json({
                    status: 'failed',
                    message,
                    data: null,
                    errors: [{ field: 'rate_limit', message, type: 'rate_limited' }],
                });
                return;
            }

            next();
        };
    }
}

// ============================================
// Factory Functions
// ============================================

/**
 * Create rate limit plugin instance
 */
export function createRateLimitPlugin(): RateLimitPlugin {
    return new RateLimitPlugin();
}

/**
 * Create rate limit middleware directly
 */
export function createRateLimitMiddleware(config: RateLimitPluginConfig) {
    const plugin = new RateLimitPlugin();
    return plugin.createMiddleware(config);
}
