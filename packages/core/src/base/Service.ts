import Repository from './Repository';
import { SearchConfig, FilterObject, OrderByConfig, PaginationResult } from '../types/response';

/**
 * Generic Service Class
 * All services should extend this class
 * @template T - Entity type
 */
export class Service<T> {
  repository: Repository<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  /**
   * Find entity by ID
   */
  async findById(id: string | number): Promise<T | null> {
    return this.repository.getById(id);
  }

  /**
   * Find all entities with pagination and filters
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: SearchConfig[],
    filters?: FilterObject,
    orderBy?: OrderByConfig
  ): Promise<PaginationResult<T>> {
    return this.repository.getAll(page, limit, search, filters, orderBy);
  }

  /**
   * Create new entity
   */
  async create(item: T): Promise<T> {
    return this.repository.create(item);
  }

  /**
   * Update existing entity
   */
  async update(id: string | number, item: Partial<T>): Promise<T> {
    return this.repository.update(id, item);
  }

  /**
   * Soft delete - marks record as deleted without removing from database
   * Sets isActive = false and deletedAt = current timestamp
   */
  async delete(id: string | number): Promise<void> {
    return this.repository.softDelete(id);
  }

  /**
   * Hard delete - permanently removes record from database
   * WARNING: This cannot be undone. Consider using delete() (soft delete) instead.
   */
  async hardDelete(id: string | number): Promise<void> {
    return this.repository.hardDelete(id);
  }

  /**
   * Create multiple entities at once
   */
  async createMany(items: T[]): Promise<T[]> {
    if (this.repository.createMany) {
      return this.repository.createMany(items);
    }
    throw new Error('createMany not implemented in repository');
  }

  /**
   * Count total entities
   */
  async count(filters?: FilterObject): Promise<number> {
    if (this.repository.count) {
      return this.repository.count(filters);
    }
    throw new Error('count not implemented in repository');
  }

  /**
   * Check if entity exists
   */
  async exists(id: string | number): Promise<boolean> {
    if (this.repository.exists) {
      return this.repository.exists(id);
    }
    const entity = await this.findById(id);
    return entity !== null;
  }
}
