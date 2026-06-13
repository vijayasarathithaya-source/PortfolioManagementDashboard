import { Router } from 'express';
import type { IAssetRepository } from '../../domain/repositories/interfaces';
import { jwtMiddleware } from '../middlewares/jwt.middleware';

export function createAssetRouter(assetRepository: IAssetRepository): Router {
  const router = Router();
  router.use(jwtMiddleware);

  router.get('/', async (req, res, next) => {
    try {
      const assets = await assetRepository.findAll();
      res.status(200).json(assets);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
