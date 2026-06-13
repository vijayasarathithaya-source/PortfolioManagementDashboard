import { Router } from 'express';
import type { IInvestmentRepository, IAssetRepository } from '../../domain/repositories/interfaces';
import { PortfolioService } from '../../application/services/portfolio.service';
import { jwtMiddleware } from '../middlewares/jwt.middleware';
import type { AuthenticatedRequest } from '../middlewares/jwt.middleware';

export function createPortfolioRouter(
  investmentRepository: IInvestmentRepository,
  assetRepository: IAssetRepository
): Router {
  const router = Router();
  const portfolioService = new PortfolioService(investmentRepository, assetRepository);

  router.use(jwtMiddleware);

  router.get('/summary', async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const summary = await portfolioService.getSummary(userId);
      res.status(200).json(summary);
    } catch (err) {
      next(err);
    }
  });

  router.get('/', async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const holdings = await portfolioService.getHoldings(userId);
      res.status(200).json(holdings);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
