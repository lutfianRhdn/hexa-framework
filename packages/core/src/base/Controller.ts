import { Request, Response } from 'express';
import { Service } from './Service';
import { ResponseMapper } from './Repository';
import {
  TResponse,
  TErrorResponse,
  TMetadataResponse,
  FilterObject,
} from '../types/response';

type TDataMetadataResponse<T, M> = {
  data: T | T[] | null;
  metadata: M;
};

/**
 * Base Controller Class
 * All controllers should extend this class
 * @template T - Response data type
 * @template M - Response metadata type
 */
export default class Controller<T, M = TMetadataResponse> {
  /**
   * Send success response
   */
  protected getSuccessResponse(
    res: Response,
    { data, metadata }: TDataMetadataResponse<T, M>,
    message?: string
  ): Response<TResponse<T, M>> {
    return res.status(200).json({
      status: 'success',
      message: message || 'Request was successful',
      data,
      metadata,
    } as TResponse<T | T[], M>);
  }

  /**
   * Send failure response
   */
  protected getFailureResponse(
    res: Response,
    { data, metadata }: TDataMetadataResponse<T, M>,
    errors: TErrorResponse[] | null,
    message?: string,
    code?: number
  ): Response<TResponse<T, M>> {
    return res.status(code || 400).json({
      status: 'failed',
      message: message || 'Request failed',
      data,
      errors: errors || undefined,
      metadata,
    } as TResponse<T, M>);
  }

  /**
   * Handle service errors with consistent response format
   * Can be overridden to add custom error handling (e.g., Prisma errors)
   */
  protected handleError(
    res: Response,
    error: unknown,
    message: string,
    statusCode: number = 500,
    emptyData: T | T[],
    emptyMetadata: M
  ) {
    console.error(`${message}:`, error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    return this.getFailureResponse(
      res,
      { data: emptyData, metadata: emptyMetadata },
      [{ field: 'server', message: errorMessage, type: 'internal_error' }],
      message,
      statusCode
    );
  }

  /**
   * Generic findAll handler
   */
  protected createFindAllHandler<E, TResponseItem extends T>(
    serviceClass: Service<E>,
    mapperClass: ResponseMapper<E, TResponseItem>
  ) {
    return async (req: Request, res: Response) => {
      try {
        const { page, limit, search_key, search_value, ...filters } = req.query;

        const pageNum = page ? parseInt(page as string, 10) : 1;
        const limitNum = limit ? parseInt(limit as string, 10) : 10;

        const search =
          search_key &&
          search_value &&
          search_key !== 'undefined' &&
          search_value !== 'undefined'
            ? [
                {
                  field: search_key as string,
                  value: search_value as string,
                },
              ]
            : undefined;

        const convertedFilters =
          Object.keys(filters).length > 0
            ? this.convertFilterTypes(filters as Record<string, unknown>)
            : undefined;

        const result = await serviceClass.findAll(
          pageNum,
          limitNum,
          search,
          convertedFilters as FilterObject
        );

        const dataMapped = mapperClass.toListResponse(result.data);

        const metadata: TMetadataResponse = {
          page: result.page,
          limit: result.limit,
          total_records: result.total,
          total_pages: result.totalPages,
        };

        return this.getSuccessResponse(
          res,
          {
            data: dataMapped as TResponseItem[],
            metadata: metadata as M,
          },
          'Data retrieved successfully'
        );
      } catch (error) {
        return this.handleError(
          res,
          error,
          'Failed to retrieve data',
          500,
          [] as TResponseItem[],
          {
            page: 1,
            limit: 10,
            total_records: 0,
            total_pages: 0,
          } as M
        );
      }
    };
  }

  /**
   * Public findAll method
   */
  findAll<E, TResponseItem extends T>(
    serviceClass: Service<E>,
    mapperClass: ResponseMapper<E, TResponseItem>
  ) {
    return this.createFindAllHandler<E, TResponseItem>(serviceClass, mapperClass);
  }

  /**
   * Generic create handler
   */
  protected createCreateHandler<E, TResponseItem extends T>(
    serviceClass: Service<E>,
    mapperClass: ResponseMapper<E, TResponseItem>,
    successMessage: string = 'Data created successfully'
  ) {
    return async (req: Request, res: Response) => {
      try {
        const requestData = this.convertToCamelCase(req.body);
        const newEntity = await serviceClass.create(requestData as E);

        const mappedData = Array.isArray(newEntity)
          ? mapperClass.toListResponse(newEntity)
          : mapperClass.toResponse
          ? mapperClass.toResponse(newEntity)
          : mapperClass.toListResponse([newEntity]);

        return this.getSuccessResponse(
          res,
          {
            data: mappedData as TResponseItem,
            metadata: {} as M,
          },
          successMessage
        );
      } catch (error) {
        return this.handleError(
          res,
          error,
          'Failed to create data',
          500,
          {} as TResponseItem,
          {} as M
        );
      }
    };
  }

  /**
   * Public create method
   */
  create<E, TResponseItem extends T>(
    serviceClass: Service<E>,
    mapperClass: ResponseMapper<E, TResponseItem>,
    successMessage: string = 'Data created successfully'
  ) {
    return this.createCreateHandler<E, TResponseItem>(
      serviceClass,
      mapperClass,
      successMessage
    );
  }

  /**
   * Generic update handler
   */
  protected createUpdateHandler<E, TResponseItem extends T>(
    serviceClass: Service<E>,
    mapperClass: ResponseMapper<E, TResponseItem>,
    successMessage: string = 'Data updated successfully'
  ) {
    return async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const requestData = this.convertToCamelCase(req.body);
        const updatedEntity = await serviceClass.update(id, requestData as Partial<E>);

        if (!updatedEntity) {
          return this.getFailureResponse(
            res,
            { data: {} as TResponseItem, metadata: {} as M },
            [{ field: 'id', message: 'Data not found', type: 'not_found' }],
            'Data not found',
            404
          );
        }

        const mappedData = Array.isArray(updatedEntity)
          ? mapperClass.toListResponse(updatedEntity)
          : mapperClass.toResponse
          ? mapperClass.toResponse(updatedEntity)
          : mapperClass.toListResponse([updatedEntity]);

        return this.getSuccessResponse(
          res,
          {
            data: mappedData as TResponseItem,
            metadata: {} as M,
          },
          successMessage
        );
      } catch (error) {
        return this.handleError(
          res,
          error,
          'Failed to update data',
          500,
          {} as TResponseItem,
          {} as M
        );
      }
    };
  }

  /**
   * Public update method
   */
  update<E, TResponseItem extends T>(
    serviceClass: Service<E>,
    mapperClass: ResponseMapper<E, TResponseItem>,
    successMessage: string = 'Data updated successfully'
  ) {
    return this.createUpdateHandler<E, TResponseItem>(
      serviceClass,
      mapperClass,
      successMessage
    );
  }

  /**
   * Generic delete handler
   */
  protected createDeleteHandler<E>(
    serviceClass: Service<E>,
    successMessage: string = 'Data deleted successfully'
  ) {
    return async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        await serviceClass.delete(id);

        return this.getSuccessResponse(
          res,
          {
            data: {} as T,
            metadata: {} as M,
          },
          successMessage
        );
      } catch (error) {
        return this.handleError(
          res,
          error,
          'Failed to delete data',
          500,
          {} as T,
          {} as M
        );
      }
    };
  }

  /**
   * Public delete method
   */
  delete<E>(
    serviceClass: Service<E>,
    successMessage: string = 'Data deleted successfully'
  ) {
    return this.createDeleteHandler<E>(serviceClass, successMessage);
  }

  /**
   * Convert filter types from query string
   */
  private convertFilterTypes(
    filters: Record<string, unknown>
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const key in filters) {
      if (Object.prototype.hasOwnProperty.call(filters, key)) {
        const value = filters[key];

        if (typeof value === 'string') {
          // Convert "true"/"false" to boolean
          if (value.toLowerCase() === 'true') {
            result[key] = true;
          } else if (value.toLowerCase() === 'false') {
            result[key] = false;
          }
          // Convert numeric strings to numbers
          else if (!isNaN(Number(value)) && value.trim() !== '') {
            result[key] = Number(value);
          }
          // Keep as string
          else {
            result[key] = value;
          }
        } else {
          result[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * Convert snake_case to camelCase
   */
  private convertToCamelCase<TObj extends Record<string, unknown>>(
    obj: TObj
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        const value = obj[key];

        if (
          value &&
          typeof value === 'object' &&
          !Array.isArray(value) &&
          !(value instanceof Date)
        ) {
          result[camelKey] = this.convertToCamelCase(
            value as Record<string, unknown>
          );
        } else if (Array.isArray(value)) {
          result[camelKey] = value.map((item) =>
            item && typeof item === 'object' && !(item instanceof Date)
              ? this.convertToCamelCase(item as Record<string, unknown>)
              : item
          );
        } else {
          result[camelKey] = value;
        }
      }
    }

    return result;
  }
}
