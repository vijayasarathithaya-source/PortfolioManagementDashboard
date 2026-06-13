import { Router } from 'express';
import type { IAssetRepository } from '../../domain/repositories/interfaces.js';
import { jwtMiddleware } from '../middlewares/jwt.middleware.js';

export function createAssetRouter(assetRepository: IAssetRepository): Router {
  const router = Router();
  router.use(jwtMiddleware);

  router.get('/', (req, res, next) => {
    try {
      throw new Error('Not implemented');
    } catch (err) {
      next(err);
    }
  });

  return router;
}
