import { Router } from 'express';
import type { ITransactionRepository } from '../../domain/repositories/interfaces.js';
import { jwtMiddleware } from '../middlewares/jwt.middleware.js';

export function createTransactionRouter(transactionRepository: ITransactionRepository): Router {
  const router = Router();
  router.use(jwtMiddleware);

  router.post('/', (req, res, next) => {
    try {
      throw new Error('Not implemented');
    } catch (err) {
      next(err);
    }
  });

  router.get('/', (req, res, next) => {
    try {
      throw new Error('Not implemented');
    } catch (err) {
      next(err);
    }
  });

  return router;
}
