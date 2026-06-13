import { Router } from 'express';
import type { IInvestmentRepository } from '../../domain/repositories/interfaces';
import { jwtMiddleware } from '../middlewares/jwt.middleware';

export function createInvestmentRouter(investmentRepository: IInvestmentRepository): Router {
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

  router.get('/:id', (req, res, next) => {
    try {
      throw new Error('Not implemented');
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id', (req, res, next) => {
    try {
      throw new Error('Not implemented');
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', (req, res, next) => {
    try {
      throw new Error('Not implemented');
    } catch (err) {
      next(err);
    }
  });

  return router;
}
