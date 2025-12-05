/**
 * Standard API Response Type
 * @template T - Data type (can be single entity or array)
 * @template M - Metadata type (pagination, etc)
 */
export type TResponse<T, M> = {
  status: "success" | "failed";
  message: string;
  data: T | T[] | null;
  metadata?: M;
  errors?: TErrorResponse[];
};

/**
 * Error Response Type
 */
export type TErrorResponse = {
  field: string;
  message: string;
  type: string;
};

/**
 * Metadata Response Type (for pagination)
 */
export type TMetadataResponse = {
  page: number;
  limit: number;
  total_records: number;
  total_pages: number;
  searchable_fields?: string[];
};

/**
 * Pagination Result from Repository
 */
export type PaginationResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/**
 * Search Configuration
 */
export type SearchConfig = {
  field: string;
  value: string;
};

/**
 * Filter Object (dynamic key-value pairs)
 */
export type FilterObject = Record<string, unknown>;

/**
 * Order By Configuration
 */
export type OrderByConfig = Record<string, 'asc' | 'desc'>;
