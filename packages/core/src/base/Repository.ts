import { SearchConfig, FilterObject, OrderByConfig, PaginationResult } from '../types/response';

/**
 * Base Entity Type
 * All entities should extend this or define similar structure
 */
export type BaseEntity = {
  id?: number | string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

/**
 * Generic Repository Interface
 * All repositories must implement this interface
 * @template T - Entity type
 */
export default abstract class Repository<T> {
  /**
   * Get entity by ID
   */
  abstract getById(id: string | number): Promise<T | null>;

  /**
   * Get all entities with pagination, search, filters, and ordering
   */
  abstract getAll(
    page: number,
    limit: number,
    search?: SearchConfig[],
    filters?: FilterObject,
    orderBy?: OrderByConfig
  ): Promise<PaginationResult<T>>;

  /**
   * Create new entity
   */
  abstract create(item: T): Promise<T>;

  /**
   * Update existing entity
   */
  abstract update(id: string | number, item: Partial<T>): Promise<T>;

  /**
   * Soft delete - marks entity as deleted
   */
  abstract softDelete(id: string | number): Promise<void>;

  /**
   * Hard delete - permanently removes entity
   */
  abstract hardDelete(id: string | number): Promise<void>;

  /**
   * Batch create multiple entities
   */
  abstract createMany?(items: T[]): Promise<T[]>;

  /**
   * Count total entities (with optional filters)
   */
  abstract count?(filters?: FilterObject): Promise<number>;

  /**
   * Check if entity exists
   */
  abstract exists?(id: string | number): Promise<boolean>;
}

/**
 * Generic Mapper Interface for Response Mapping
 */
export interface ResponseMapper<TEntity, TResponse> {
  toListResponse(entities: TEntity[] | TEntity): TResponse[] | TResponse;
  toResponse?(entity: TEntity): TResponse;
}
