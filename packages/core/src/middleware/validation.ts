import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { TErrorResponse, TResponse } from '../types/response';

/**
 * Send failure response helper
 */
const sendFailureResponse = (
  res: Response,
  errors: TErrorResponse[],
  message: string,
  code: number
): Response => {
  return res.status(code).json({
    status: 'failed',
    message,
    data: null,
    errors,
    metadata: null,
  } as TResponse<null, null>);
};

/**
 * Create Validation Middleware using Zod schema
 * @param schema - Zod validation schema
 * @param target - Which part of request to validate ('body' | 'query' | 'params')
 * @returns Express middleware function
 * 
 * @example
 * ```typescript
 * import { z } from 'zod';
 * 
 * const createProductSchema = z.object({
 *   name: z.string().min(3),
 *   price: z.number().positive(),
 * });
 * 
 * router.post(
 *   '/products',
 *   createValidationMiddleware(createProductSchema, 'body'),
 *   handler
 * );
 * ```
 */
export const createValidationMiddleware = (
  schema: ZodSchema,
  target: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate the target
      await schema.parseAsync(req[target]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: TErrorResponse[] = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          type: 'validation_error',
        }));

        sendFailureResponse(
          res,
          errors,
          'Validation failed',
          400
        );
        return;
      }

      // Unknown error
      sendFailureResponse(
        res,
        [
          {
            field: 'server',
            message: 'Validation error occurred',
            type: 'server_error',
          },
        ],
        'Validation error occurred',
        500
      );
    }
  };
};

/**
 * Shorthand for body validation
 */
export const validateBody = (schema: ZodSchema) =>
  createValidationMiddleware(schema, 'body');

/**
 * Shorthand for query validation
 */
export const validateQuery = (schema: ZodSchema) =>
  createValidationMiddleware(schema, 'query');

/**
 * Shorthand for params validation
 */
export const validateParams = (schema: ZodSchema) =>
  createValidationMiddleware(schema, 'params');
