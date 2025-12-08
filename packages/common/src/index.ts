/**
 * @hexa/common
 * Shared interfaces and types for Hexa Framework ecosystem
 * by lutfian.rhdn
 */

// ============================================
// Database Adapter Interfaces
// ============================================

/**
 * Database adapter interface - all database adapters must implement this
 */
export interface IDatabaseAdapter<TClient = unknown> {
    readonly name: string;

    /**
     * Connect to the database
     */
    connect(): Promise<void>;

    /**
     * Disconnect from the database
     */
    disconnect(): Promise<void>;

    /**
     * Get the underlying database client
     */
    getClient(): TClient;

    /**
     * Check if connected
     */
    isConnected(): boolean;
}

/**
 * Database adapter configuration
 */
export interface DatabaseAdapterConfig {
    url?: string;
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    ssl?: boolean;
    poolSize?: number;
    [key: string]: unknown;
}

// ============================================
// Repository Interfaces
// ============================================

/**
 * Base entity type that all entities should extend
 */
export interface IBaseEntity {
    id?: number | string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

/**
 * Pagination options for queries
 */
export interface PaginationOptions {
    page: number;
    limit: number;
}

/**
 * Pagination result
 */
export interface PaginationResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Search configuration
 */
export interface SearchConfig {
    field: string;
    value: string;
    operator?: 'contains' | 'equals' | 'startsWith' | 'endsWith';
}

/**
 * Filter object for queries
 */
export type FilterObject = Record<string, unknown>;

/**
 * Order by configuration
 */
export type OrderByConfig = Record<string, 'asc' | 'desc'>;

/**
 * Query options combining all query parameters
 */
export interface QueryOptions {
    pagination?: PaginationOptions;
    search?: SearchConfig[];
    filters?: FilterObject;
    orderBy?: OrderByConfig;
    include?: string[];
}

/**
 * Generic repository interface - all repositories must implement this
 */
export interface IRepository<T extends IBaseEntity> {
    /**
     * Get entity by ID
     */
    getById(id: string | number): Promise<T | null>;

    /**
     * Get all entities with query options
     */
    getAll(options?: QueryOptions): Promise<PaginationResult<T>>;

    /**
     * Create new entity
     */
    create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;

    /**
     * Update existing entity
     */
    update(id: string | number, item: Partial<T>): Promise<T>;

    /**
     * Soft delete entity
     */
    softDelete(id: string | number): Promise<void>;

    /**
     * Hard delete entity
     */
    hardDelete(id: string | number): Promise<void>;

    /**
     * Create multiple entities
     */
    createMany?(items: Array<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T[]>;

    /**
     * Count entities with optional filters
     */
    count?(filters?: FilterObject): Promise<number>;

    /**
     * Check if entity exists
     */
    exists?(id: string | number): Promise<boolean>;
}

// ============================================
// Transport Interfaces
// ============================================

/**
 * Route method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

/**
 * Route definition
 */
export interface RouteDefinition {
    path: string;
    method: HttpMethod;
    handler: string;
    middlewares?: string[];
    permission?: string;
    description?: string;
}

/**
 * Transport interface - all transports must implement this
 */
export interface ITransport {
    readonly name: string;

    /**
     * Initialize the transport with the application
     */
    init(app: unknown, options?: TransportOptions): Promise<void>;

    /**
     * Register routes
     */
    registerRoutes(routes: RouteDefinition[]): void;

    /**
     * Start listening (if applicable)
     */
    start?(port: number): Promise<void>;

    /**
     * Stop the transport
     */
    stop?(): Promise<void>;
}

/**
 * Transport options
 */
export interface TransportOptions {
    prefix?: string;
    version?: string;
    cors?: boolean | CorsOptions;
    rateLimit?: RateLimitOptions;
    [key: string]: unknown;
}

/**
 * CORS options
 */
export interface CorsOptions {
    origin?: string | string[] | boolean;
    methods?: HttpMethod[];
    allowedHeaders?: string[];
    credentials?: boolean;
}

/**
 * Rate limit options
 */
export interface RateLimitOptions {
    windowMs: number;
    max: number;
    message?: string;
}

// ============================================
// Plugin Interfaces
// ============================================

/**
 * Plugin lifecycle hooks
 */
export interface PluginHooks {
    onInit?(): Promise<void>;
    onReady?(): Promise<void>;
    onShutdown?(): Promise<void>;
}

/**
 * Plugin interface - all plugins must implement this
 */
export interface IPlugin extends PluginHooks {
    readonly name: string;
    readonly version: string;

    /**
     * Initialize the plugin
     */
    init(config?: PluginConfig): Promise<void>;

    /**
     * Get plugin metadata
     */
    getMetadata(): PluginMetadata;
}

/**
 * Plugin configuration
 */
export interface PluginConfig {
    enabled?: boolean;
    [key: string]: unknown;
}

/**
 * Plugin metadata
 */
export interface PluginMetadata {
    name: string;
    version: string;
    description?: string;
    author?: string;
    dependencies?: string[];
}

// ============================================
// Response Types
// ============================================

/**
 * Standard API response type
 */
export interface ApiResponse<T, M = MetadataResponse> {
    status: 'success' | 'failed';
    message: string;
    data: T | T[] | null;
    metadata?: M;
    errors?: ErrorResponse[];
}

/**
 * Error response type
 */
export interface ErrorResponse {
    field: string;
    message: string;
    type: string;
    code?: string;
}

/**
 * Metadata response type
 */
export interface MetadataResponse {
    page?: number;
    limit?: number;
    total_records?: number;
    total_pages?: number;
    [key: string]: unknown;
}

// ============================================
// Authentication Types
// ============================================

/**
 * JWT payload interface
 */
export interface JWTPayload {
    id: string | number;
    username: string;
    role: string;
    exp?: number;
    iat?: number;
    [key: string]: unknown;
}

/**
 * Authenticated user interface
 */
export interface AuthenticatedUser {
    id: string | number;
    username: string;
    role: string;
    permissions?: string[];
    [key: string]: unknown;
}

// ============================================
// Event Types
// ============================================

/**
 * Domain event interface
 */
export interface IDomainEvent<T = unknown> {
    readonly eventName: string;
    readonly occurredAt: Date;
    readonly payload: T;
    readonly aggregateId?: string | number;
}

/**
 * Event handler type
 */
export type EventHandler<T = unknown> = (event: IDomainEvent<T>) => Promise<void>;

/**
 * Event bus interface
 */
export interface IEventBus {
    /**
     * Publish an event
     */
    publish<T>(event: IDomainEvent<T>): Promise<void>;

    /**
     * Subscribe to an event
     */
    subscribe<T>(eventName: string, handler: EventHandler<T>): void;

    /**
     * Unsubscribe from an event
     */
    unsubscribe(eventName: string, handler: EventHandler): void;
}

// ============================================
// Logger Interface
// ============================================

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Logger interface
 */
export interface ILogger {
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
    fatal(message: string, meta?: Record<string, unknown>): void;
}

// ============================================
// Cache Interface
// ============================================

/**
 * Cache interface
 */
export interface ICache {
    /**
     * Get value from cache
     */
    get<T>(key: string): Promise<T | null>;

    /**
     * Set value in cache
     */
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;

    /**
     * Delete value from cache
     */
    delete(key: string): Promise<void>;

    /**
     * Clear all cache
     */
    clear(): Promise<void>;

    /**
     * Check if key exists
     */
    exists(key: string): Promise<boolean>;
}

// ============================================
// Payment Interface
// ============================================

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'expired' | 'canceled';

export interface PaymentItem {
    id: string;
    price: number;
    quantity: number;
    name: string;
    brand?: string;
    category?: string;
}

export interface CustomerDetails {
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    billingAddress?: Address;
    shippingAddress?: Address;
}

export interface Address {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address: string;
    city: string;
    postalCode: string;
    countryCode: string;
}

export interface PaymentRequest {
    orderId: string;
    amount: number;
    currency?: string;
    items?: PaymentItem[];
    customer?: CustomerDetails;
    description?: string;
    metadata?: Record<string, unknown>;
    paymentMethod?: string; // e.g., 'credit_card', 'gopay', 'bank_transfer'
    returnUrl?: string; // Redirect URL after payment
    cancelUrl?: string;
}

export interface PaymentResult {
    transactionId: string;
    status: PaymentStatus;
    redirectUrl?: string; // For redirect-based payments (e.g. Midtrans Snap)
    token?: string; // For frontend SDKs
    raw?: unknown; // Raw response from provider
}

export interface IPaymentAdapter {
    readonly name: string;

    /**
     * Create a payment transaction
     */
    createTransaction(request: PaymentRequest): Promise<PaymentResult>;

    /**
     * Check transaction status
     */
    checkStatus(transactionId: string): Promise<PaymentStatus>;

    /**
     * Handle webhook/notification
     * Returns the parsed status and the raw event to verify signature
     */
    verifyNotification(payload: unknown): Promise<{
        orderId: string;
        transactionId: string;
        status: PaymentStatus;
        raw: unknown;
    }>;
}
