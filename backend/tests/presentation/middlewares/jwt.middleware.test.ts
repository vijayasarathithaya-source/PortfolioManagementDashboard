import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtMiddleware } from '../../../src/presentation/middlewares/jwt.middleware.js';
import type { AuthenticatedRequest } from '../../../src/presentation/middlewares/jwt.middleware.js';

describe('JWT Middleware (TDD)', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();
  const JWT_SECRET = 'test-secret';

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn() as any,
    };
    nextFunction = jest.fn();
    // Ensure we override process.env.JWT_SECRET for tests
    process.env.JWT_SECRET = JWT_SECRET;
  });

  it('should call next() and populate req.user if a valid token is provided', () => {
    const payload = { id: 'user-uuid-123', email: 'investor@example.com' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    jwtMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user?.id).toBe(payload.id);
    expect(mockRequest.user?.email).toBe(payload.email);
  });

  it('should return 401 if Authorization header is missing', () => {
    mockRequest.headers = {};

    jwtMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Authorization header missing') })
    );
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if Authorization header is not in Bearer format', () => {
    mockRequest.headers = {
      authorization: 'Basic dXNlcjpwYXNz',
    };

    jwtMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Format is Authorization: Bearer') })
    );
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if token is expired', () => {
    const payload = { id: 'user-uuid-123', email: 'investor@example.com' };
    // Generate an expired token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '0s' });

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    jwtMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Token expired') })
    );
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if token signature is invalid', () => {
    const payload = { id: 'user-uuid-123', email: 'investor@example.com' };
    const token = jwt.sign(payload, 'wrong-secret');

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    jwtMiddleware(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Invalid token') })
    );
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
