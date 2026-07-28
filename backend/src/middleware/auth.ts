import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '../models/User';
import { verifyAccessToken } from '../utils/auth';
import { HttpError } from '../utils/HttpError';

function readBearerToken(req: Request): string | undefined {
  const authorization = req.header('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return undefined;
  }
  return authorization.slice('Bearer '.length).trim();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = readBearerToken(req);
  if (token) {
    req.auth = verifyAccessToken(token);
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = readBearerToken(req);
  if (!token) {
    next(new HttpError(401, 'Authentication is required.'));
    return;
  }

  req.auth = verifyAccessToken(token);
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      next(new HttpError(403, 'You do not have permission to perform this action.'));
      return;
    }
    next();
  };
}
