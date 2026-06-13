import { Router } from 'express';
import type { IInvestmentRepository } from '../../domain/repositories/interfaces';
import { jwtMiddleware } from '../middlewares/jwt.middleware';
import type { AuthenticatedRequest } from '../middlewares/jwt.middleware';

export function createInvestmentRouter(investmentRepository: IInvestmentRepository): Router {
  const router = Router();

  router.use(jwtMiddleware);

  router.post('/', async (req: AuthenticatedRequest, res, next) => {
    try {
      const { assetId, quantity, purchasePrice, purchaseDate } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!assetId) {
        return res.status(400).json({ error: 'Asset ID is mandatory' });
      }

      if (quantity === undefined || quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be greater than zero' });
      }

      if (purchasePrice === undefined || purchasePrice <= 0) {
        return res.status(400).json({ error: 'Purchase price must be greater than zero' });
      }

      const investment = await investmentRepository.create({
        userId,
        assetId,
        quantity,
        purchasePrice,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      });

      res.status(201).json(investment);
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

      const investments = await investmentRepository.findByUserId(userId);
      res.status(200).json(investments);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!id) {
        return res.status(400).json({ error: 'Investment ID is required' });
      }

      const investment = await investmentRepository.findById(id);
      if (!investment) {
        return res.status(404).json({ error: 'Investment not found' });
      }

      if (investment.userId !== userId) {
        return res.status(403).json({ error: 'Access denied to this investment' });
      }

      res.status(200).json(investment);
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id', async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const { assetId, quantity, purchasePrice } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!id) {
        return res.status(400).json({ error: 'Investment ID is required' });
      }

      const original = await investmentRepository.findById(id);
      if (!original) {
        return res.status(404).json({ error: 'Investment not found' });
      }

      if (original.userId !== userId) {
        return res.status(403).json({ error: 'Access denied to this investment' });
      }

      if (assetId && assetId !== original.assetId) {
        return res.status(400).json({ error: 'Asset ID cannot be modified after creation' });
      }

      const updated = await investmentRepository.update(id, {
        quantity,
        purchasePrice,
      });

      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!id) {
        return res.status(400).json({ error: 'Investment ID is required' });
      }

      const original = await investmentRepository.findById(id);
      if (!original) {
        return res.status(404).json({ error: 'Investment not found' });
      }

      if (original.userId !== userId) {
        return res.status(403).json({ error: 'Access denied to this investment' });
      }

      await investmentRepository.delete(id);
      res.status(200).json({ message: 'Investment deleted successfully' });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
