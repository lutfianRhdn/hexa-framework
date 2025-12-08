/**
 * @hexa/transport-rest
 * REST transport layer for Hexa Framework (Express.js)
 * by lutfian.rhdn
 */

import { Request, Response, NextFunction, Router, Express } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import {
    ITransport,
    TransportOptions,
    RouteDefinition,
    ApiResponse,
    ErrorResponse,
    MetadataResponse,
    JWTPayload,
    AuthenticatedUser,
} from '@hexa-framework/common';

// ============================================
// REST Transport
// ============================================

export interface RestTransportOptions extends TransportOptions {
    bodyParser?: boolean;
    corsOptions?: {
        origin?: string | string[];
        credentials?: boolean;
    };
}

/**
 * REST Transport
 * Provides Express.js-based REST API transport
 */
export class RestTransport implements ITransport {
    readonly name = 'rest';
    private app: Express | null = null;
    private router: Router;

    constructor() {
        this.router = Router();
    }

    async init(app: Express, options?: RestTransportOptions): Promise<void> {
        this.app = app;

        const prefix = options?.prefix || '/api';
        const version = options?.version || 'v1';

        app.use(`${prefix}/${version}`, this.router);
    }

    registerRoutes(routes: RouteDefinition[]): void {
        routes.forEach((route) => {
            const method = route.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';
            // Routes should be registered by the user with actual handlers
            console.log(`[REST] Registered: ${route.method} ${route.path}`);
        });
    }

    getRouter(): Router {
        return this.router;
    }
}

// ============================================
// Base Controller
// ============================================

/**
 * Base Controller
 * All REST controllers should extend this class
 */
export abstract class BaseController<T = unknown, M = MetadataResponse> {
    /**
     * Send success response
     */
    protected success(
        res: Response,
        data: T | T[] | null,
        message = 'Success',
        metadata?: M
    ): Response<ApiResponse<T, M>> {
        return res.status(200).json({
            status: 'success',
            message,
            data,
            metadata,
        });
    }

    /**
     * Send created response
     */
    protected created(
        res: Response,
        data: T,
        message = 'Created successfully'
    ): Response<ApiResponse<T, M>> {
        return res.status(201).json({
            status: 'success',
            message,
            data,
        });
    }

    /**
     * Send failure response
     */
    protected fail(
        res: Response,
        message: string,
        errors: ErrorResponse[] = [],
        statusCode = 400
    ): Response<ApiResponse<T, M>> {
        return res.status(statusCode).json({
            status: 'failed',
            message,
            data: null,
            errors,
        });
    }

    /**
     * Send not found response
     */
    protected notFound(
        res: Response,
        message = 'Resource not found'
    ): Response<ApiResponse<T, M>> {
        return this.fail(
            res,
            message,
            [{ field: 'id', message, type: 'not_found' }],
            404
        );
    }

    /**
     * Send server error response
     */
    protected serverError(
        res: Response,
        error: unknown,
        message = 'Internal server error'
    ): Response<ApiResponse<T, M>> {
        console.error(message, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return this.fail(
            res,
            message,
            [{ field: 'server', message: errorMessage, type: 'internal_error' }],
            500
        );
    }

    /**
     * Async handler wrapper for error handling
     */
    protected asyncHandler(
        fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
    ) {
        return (req: Request, res: Response, next: NextFunction) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }
}

// ============================================
// Middleware
// ============================================

export interface AuthRequest extends Request {
    user?: AuthenticatedUser;
}

export interface AuthMiddlewareConfig {
    jwtSecret: string;
    getUserDetails?: (payload: JWTPayload) => Promise<Partial<AuthenticatedUser>>;
}

/**
 * Create authentication middleware
 */
export function createAuthMiddleware(config: AuthMiddlewareConfig) {
    return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                res.status(401).json({
                    status: 'failed',
                    message: 'No authorization header provided',
                    data: null,
                    errors: [{ field: 'authorization', message: 'Missing authorization header', type: 'required' }],
                });
                return;
            }

            const token = authHeader.startsWith('Bearer ')
                ? authHeader.substring(7)
                : authHeader;

            const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;

            req.user = {
                id: decoded.id,
                username: decoded.username,
                role: decoded.role,
            };

            if (config.getUserDetails) {
                const additionalDetails = await config.getUserDetails(decoded);
                req.user = { ...req.user, ...additionalDetails };
            }

            next();
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                res.status(401).json({
                    status: 'failed',
                    message: 'Invalid token',
                    data: null,
                    errors: [{ field: 'token', message: 'Invalid token', type: 'invalid' }],
                });
                return;
            }

            if (error instanceof jwt.TokenExpiredError) {
                res.status(401).json({
                    status: 'failed',
                    message: 'Token expired',
                    data: null,
                    errors: [{ field: 'token', message: 'Token has expired', type: 'expired' }],
                });
                return;
            }

            res.status(500).json({
                status: 'failed',
                message: 'Authentication failed',
                data: null,
                errors: [{ field: 'server', message: 'Authentication error', type: 'server_error' }],
            });
        }
    };
}

/**
 * Create permission middleware
 */
export function createPermissionMiddleware(requiredPermission: string) {
    return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        if (!req.user) {
            res.status(401).json({
                status: 'failed',
                message: 'User not authenticated',
                data: null,
                errors: [{ field: 'authorization', message: 'User not authenticated', type: 'unauthorized' }],
            });
            return;
        }

        const userPermissions = req.user.permissions || [];
        if (!userPermissions.includes(requiredPermission)) {
            res.status(403).json({
                status: 'failed',
                message: 'Insufficient permissions',
                data: null,
                errors: [{ field: 'permission', message: `Permission '${requiredPermission}' required`, type: 'forbidden' }],
            });
            return;
        }

        next();
    };
}

/**
 * Create validation middleware using Zod
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors: ErrorResponse[] = result.error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
                type: 'validation',
            }));

            res.status(400).json({
                status: 'failed',
                message: 'Validation failed',
                data: null,
                errors,
            });
            return;
        }

        req.body = result.data;
        next();
    };
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.query);

        if (!result.success) {
            const errors: ErrorResponse[] = result.error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
                type: 'validation',
            }));

            res.status(400).json({
                status: 'failed',
                message: 'Query validation failed',
                data: null,
                errors,
            });
            return;
        }

        (req as any).validatedQuery = result.data;
        next();
    };
}

export function validateParams<T>(schema: z.ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.params);

        if (!result.success) {
            const errors: ErrorResponse[] = result.error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
                type: 'validation',
            }));

            res.status(400).json({
                status: 'failed',
                message: 'Params validation failed',
                data: null,
                errors,
            });
            return;
        }

        (req as any).validatedParams = result.data;
        next();
    };
}

// ============================================
// Factory Functions
// ============================================

/**
 * Create REST transport instance
 */
export function createRestTransport(): RestTransport {
    return new RestTransport();
}

// Re-export types
export type { Router, Request, Response, NextFunction, Express } from 'express';
