import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { UnauthorizedError, ForbiddenError } from '../utils/appError';
import { getAdminClient, isSupabaseConfigured } from '../config/supabase';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Cleanly authenticate requests using Supabase JWTs with full support
 * for development, testing, and mock sandbox verification.
 */
export const authenticateUser = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const isProd = env.NODE_ENV === 'production';
    
    // In production, ignore development headers completely for security
    const devUserIdHeader = isProd ? undefined : (req.headers['x-dev-user-id'] as string | undefined);
    const devRoleHeader = isProd ? undefined : (req.headers['x-dev-role'] as string | undefined);

    // 1. In production, an Authorization header starting with 'Bearer ' is strictly mandatory
    if (isProd) {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or malformed Authorization header. Expected Bearer token.');
      }
    } else {
      if (!authHeader && !devUserIdHeader) {
        throw new UnauthorizedError('Missing or malformed Authorization header. Expected Bearer token.');
      }
      if (authHeader && !authHeader.startsWith('Bearer ') && !devUserIdHeader) {
        throw new UnauthorizedError('Missing or malformed Authorization header. Expected Bearer token.');
      }
    }

    const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : '';

    // 2. Reject service role key or anon key passed as a user bearer token
    if (
      (env.SUPABASE_SERVICE_ROLE_KEY && token === env.SUPABASE_SERVICE_ROLE_KEY) ||
      (env.SUPABASE_ANON_KEY && token === env.SUPABASE_ANON_KEY)
    ) {
      throw new UnauthorizedError('Administrative or API service keys cannot be used as user bearer tokens.');
    }

    // 3. In development / test, allow instant dev bypass via explicit header or mock/dev token
    const isMockOrDevToken =
      devUserIdHeader !== undefined ||
      token.includes('mock-') ||
      token.includes('dev-') ||
      token.includes('test-');

    if (!isProd && isMockOrDevToken) {
      const devId = devUserIdHeader || '11111111-2222-3333-4444-555555555555';
      const devRole = devRoleHeader || (devId.includes('admin') ? 'admin' : 'authenticated');

      logger.info(`[AUTH] Development mode authentication for user: ${devId} (role: ${devRole})`);
      req.user = {
        id: devId,
        email: (req.headers['x-dev-email'] as string) || 'developer@local.test',
        role: devRole,
      };
      req.token = token || 'dev-mock-token';
      return next();
    }

    // In production, reject any mock or test tokens immediately
    if (isProd && isMockOrDevToken) {
      throw new UnauthorizedError('Mock or development authentication tokens are not allowed in production.');
    }

    if (!isSupabaseConfigured()) {
      if (env.NODE_ENV !== 'production') {
        req.user = {
          id: devUserIdHeader || '11111111-2222-3333-4444-555555555555',
          email: 'dev@margdarshak.local',
          role: devRoleHeader || 'authenticated',
        };
        req.token = token;
        return next();
      }
      throw new UnauthorizedError('Supabase authentication service is currently not configured.');
    }

    // 4. Verify token server-side via Supabase Auth
    try {
      const supabase = getAdminClient();
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        if (env.NODE_ENV !== 'production' && devUserIdHeader) {
          logger.warn(`[AUTH] Supabase token check failed, falling back to X-Dev-User-Id: ${devUserIdHeader}`);
          req.user = {
            id: devUserIdHeader,
            email: 'dev@margdarshak.local',
            role: devRoleHeader || 'authenticated',
          };
          req.token = token;
          return next();
        }
        logger.warn('Token verification failed with Supabase Auth', { error: error?.message });
        throw new UnauthorizedError('Invalid or expired authentication token');
      }

      // Attach verified user identity from Supabase Auth to request
      req.user = {
        id: user.id,
        email: user.email,
        role: (user.app_metadata?.role as string) || user.role || 'authenticated',
      };
      req.token = token;

      next();
    } catch (err: any) {
      if (err instanceof UnauthorizedError) throw err;
      if (env.NODE_ENV !== 'production' && devUserIdHeader) {
        req.user = {
          id: devUserIdHeader,
          email: 'dev@margdarshak.local',
          role: devRoleHeader || 'authenticated',
        };
        req.token = token;
        return next();
      }
      throw new UnauthorizedError(`Authentication failed: ${err.message}`);
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Protected Admin check middleware.
 * Verifies that the authenticated user possesses administrator permissions.
 */
export const requireAdmin = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('Authentication required to access administrative resource.');
    }

    const isProd = env.NODE_ENV === 'production';
    const devRoleHeader = isProd ? undefined : (req.headers['x-dev-role'] as string | undefined);
    const adminKeyHeader = isProd ? undefined : (req.headers['x-admin-key'] as string | undefined);

    const isAdminUser =
      req.user.role === 'admin' ||
      (!isProd && (
        devRoleHeader === 'admin' ||
        adminKeyHeader === 'margdarshak-admin-secret' ||
        req.user.id.includes('admin') ||
        req.user.email?.includes('admin')
      ));

    if (!isAdminUser) {
      logger.warn(`[AUTH] Access denied: User ${req.user.id} does not have administrator privileges.`);
      throw new ForbiddenError('Administrator access required.');
    }

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Optional authentication helper: parses user identity if token exists,
 * but allows unauthenticated guest requests through.
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.headers.authorization || req.headers['x-dev-user-id']) {
    void authenticateUser(req, res, next);
    return;
  }
  next();
};
