import { Router } from 'express';
import type { ITransactionRepository } from '../../domain/repositories/interfaces';
import { jwtMiddleware } from '../middlewares/jwt.middleware';

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
