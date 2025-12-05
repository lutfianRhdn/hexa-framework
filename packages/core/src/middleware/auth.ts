import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TErrorResponse, TResponse } from '../types/response';

/**
 * Extended Request with user information
 */
export interface AuthRequest extends Request {
  user?: {
    id: string | number;
    username: string;
    role: string;
    [key: string]: unknown; // Allow additional custom fields
  };
}

/**
 * JWT Payload Interface
 */
export interface JWTPayload {
  id: string | number;
  username: string;
  role: string;
  [key: string]: unknown;
}

/**
 * Auth Middleware Configuration
 */
export interface AuthConfig {
  jwtSecret: string;
  getUserDetails?: (decoded: JWTPayload) => Promise<Partial<AuthRequest['user']>>;
}

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
 * Create Authentication Middleware
 * @param config - Auth configuration with JWT secret
 * @returns Express middleware function
 * 
 * @example
 * ```typescript
 * const authMiddleware = createAuthMiddleware({
 *   jwtSecret: process.env.JWT_SECRET!,
 *   getUserDetails: async (decoded) => {
 *     const user = await prisma.user.findUnique({ where: { id: decoded.id } });
 *     return { outlet_id: user?.outlet_id };
 *   }
 * });
 * 
 * router.get('/protected', authMiddleware, handler);
 * ```
 */
export const createAuthMiddleware = (config: AuthConfig) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        sendFailureResponse(
          res,
          [
            {
              field: 'authorization',
              message: 'No authorization header provided',
              type: 'required',
            },
          ],
          'No authorization header provided',
          401
        );
        return;
      }

      const token = authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : authHeader;

      if (!token) {
        sendFailureResponse(
          res,
          [{ field: 'token', message: 'No token provided', type: 'required' }],
          'No token provided',
          401
        );
        return;
      }

      const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;

      // Base user info from token
      req.user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
      };

      // Fetch additional user details if handler provided
      if (config.getUserDetails) {
        const additionalDetails = await config.getUserDetails(decoded);
        req.user = { ...req.user, ...additionalDetails };
      }

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        sendFailureResponse(
          res,
          [{ field: 'token', message: 'Invalid token', type: 'invalid' }],
          'Invalid token',
          401
        );
        return;
      }

      if (error instanceof jwt.TokenExpiredError) {
        sendFailureResponse(
          res,
          [{ field: 'token', message: 'Token has expired', type: 'expired' }],
          'Token has expired',
          401
        );
        return;
      }

      sendFailureResponse(
        res,
        [{ field: 'server', message: 'Authentication failed', type: 'server_error' }],
        'Authentication failed',
        500
      );
    }
  };
};

/**
 * Simple auth middleware without additional user fetching
 * Use this for basic JWT validation
 */
export const authMiddleware = createAuthMiddleware({
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
});
