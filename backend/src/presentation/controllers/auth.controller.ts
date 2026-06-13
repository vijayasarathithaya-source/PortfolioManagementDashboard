import { Router } from 'express';
import type { IUserRepository } from '../../domain/repositories/interfaces.js';

export function createAuthRouter(userRepository: IUserRepository): Router {
  const router = Router();

  router.post('/register', (req, res, next) => {
    try {
      throw new Error('Not implemented');
    } catch (err) {
      next(err);
    }
  });

  router.post('/login', (req, res, next) => {
    try {
      throw new Error('Not implemented');
    } catch (err) {
      next(err);
    }
  });

  router.post('/logout', (req, res, next) => {
    try {
      throw new Error('Not implemented');
    } catch (err) {
      next(err);
    }
  });

  router.get('/profile', (req, res, next) => {
    try {
      throw new Error('Not implemented');
    } catch (err) {
      next(err);
    }
  });

  return router;
}
