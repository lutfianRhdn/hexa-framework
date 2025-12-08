/**
 * @hexa/plugin-logging
 * Request logging plugin for Hexa Framework
 * by lutfian.rhdn
 */

import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { IPlugin, PluginConfig, PluginMetadata, ILogger, LogLevel } from '@hexa-framework/common';

// ============================================
// Types
// ============================================

export interface LoggingPluginConfig extends PluginConfig {
    format?: 'json' | 'text';
    includeBody?: boolean;
    includeHeaders?: boolean;
    excludePaths?: string[];
    correlationHeader?: string;
}

interface RequestLog {
    correlationId: string;
    method: string;
    path: string;
    query?: Record<string, unknown>;
    body?: unknown;
    headers?: Record<string, string>;
    ip?: string;
    userAgent?: string;
    startTime: number;
}

interface ResponseLog extends RequestLog {
    statusCode: number;
    duration: number;
    contentLength?: number;
}

// ============================================
// Console Logger
// ============================================

/**
 * Simple console logger implementing ILogger
 */
export class ConsoleLogger implements ILogger {
    private format: 'json' | 'text';

    constructor(format: 'json' | 'text' = 'text') {
        this.format = format;
    }

    private log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
        const timestamp = new Date().toISOString();

        if (this.format === 'json') {
            console.log(JSON.stringify({ timestamp, level, message, ...meta }));
        } else {
            const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
            console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`);
        }
    }

    debug(message: string, meta?: Record<string, unknown>): void {
        this.log('debug', message, meta);
    }

    info(message: string, meta?: Record<string, unknown>): void {
        this.log('info', message, meta);
    }

    warn(message: string, meta?: Record<string, unknown>): void {
        this.log('warn', message, meta);
    }

    error(message: string, meta?: Record<string, unknown>): void {
        this.log('error', message, meta);
    }

    fatal(message: string, meta?: Record<string, unknown>): void {
        this.log('fatal', message, meta);
    }
}

// ============================================
// Logging Plugin
// ============================================

/**
 * Logging Plugin
 * Request/response logging with correlation IDs
 */
export class LoggingPlugin implements IPlugin {
    readonly name = 'logging';
    readonly version = '1.0.0';
    private logger: ILogger;
    private config: LoggingPluginConfig = {};

    constructor(logger?: ILogger) {
        this.logger = logger || new ConsoleLogger();
    }

    async init(config?: LoggingPluginConfig): Promise<void> {
        this.config = config || {};
        this.logger = new ConsoleLogger(config?.format || 'text');
    }

    async onInit(): Promise<void> { }
    async onReady(): Promise<void> { }
    async onShutdown(): Promise<void> { }

    getMetadata(): PluginMetadata {
        return {
            name: this.name,
            version: this.version,
            description: 'Request/response logging with correlation IDs',
            author: 'lutfian.rhdn',
        };
    }

    /**
     * Create logging middleware
     */
    createMiddleware(config?: LoggingPluginConfig) {
        const options = { ...this.config, ...config };
        const correlationHeader = options.correlationHeader || 'x-correlation-id';
        const excludePaths = options.excludePaths || ['/health', '/favicon.ico'];

        return (req: Request, res: Response, next: NextFunction): void => {
            // Skip excluded paths
            if (excludePaths.some((p) => req.path.startsWith(p))) {
                next();
                return;
            }

            // Get or generate correlation ID
            const correlationId = (req.headers[correlationHeader] as string) || randomUUID();
            res.setHeader(correlationHeader, correlationId);
            (req as any).correlationId = correlationId;

            const requestLog: RequestLog = {
                correlationId,
                method: req.method,
                path: req.path,
                query: Object.keys(req.query).length > 0 ? req.query as Record<string, unknown> : undefined,
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                startTime: Date.now(),
            };

            if (options.includeBody && req.body) {
                requestLog.body = req.body;
            }

            if (options.includeHeaders) {
                requestLog.headers = req.headers as Record<string, string>;
            }

            this.logger.info(`→ ${req.method} ${req.path}`, requestLog as unknown as Record<string, unknown>);

            // Capture response
            const originalEnd = res.end;
            res.end = ((...args: any[]) => {
                const responseLog: ResponseLog = {
                    ...requestLog,
                    statusCode: res.statusCode,
                    duration: Date.now() - requestLog.startTime,
                    contentLength: parseInt(res.getHeader('content-length') as string) || undefined,
                };

                const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
                this.logger[level](`← ${res.statusCode} ${req.method} ${req.path} (${responseLog.duration}ms)`, responseLog as unknown as Record<string, unknown>);

                return originalEnd.apply(res, args as [any, any, any?]);
            }) as any;

            next();
        };
    }

    getLogger(): ILogger {
        return this.logger;
    }
}

// ============================================
// Factory Functions
// ============================================

/**
 * Create logging plugin instance
 */
export function createLoggingPlugin(logger?: ILogger): LoggingPlugin {
    return new LoggingPlugin(logger);
}

/**
 * Create logging middleware directly
 */
export function createLoggingMiddleware(config?: LoggingPluginConfig) {
    const plugin = new LoggingPlugin();
    plugin.init(config);
    return plugin.createMiddleware(config);
}

/**
 * Create console logger
 */
export function createLogger(format: 'json' | 'text' = 'text'): ILogger {
    return new ConsoleLogger(format);
}
