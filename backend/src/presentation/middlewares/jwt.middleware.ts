import type { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export function jwtMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Stub implementation for TDD: throws Error
  throw new Error('Not implemented');
}
