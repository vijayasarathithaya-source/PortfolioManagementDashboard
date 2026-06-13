import { Router } from 'express';
import type { ITransactionRepository, IInvestmentRepository } from '../../domain/repositories/interfaces';
import { TransactionService } from '../../application/services/transaction.service';
import { jwtMiddleware } from '../middlewares/jwt.middleware';
import type { AuthenticatedRequest } from '../middlewares/jwt.middleware';
import type { TransactionType, AssetType } from '../../domain/entities';

export function createTransactionRouter(
  transactionRepository: ITransactionRepository,
  investmentRepository: IInvestmentRepository
): Router {
  const router = Router();
  const transactionService = new TransactionService(transactionRepository, investmentRepository);

  router.use(jwtMiddleware);

  router.post('/', async (req: AuthenticatedRequest, res, next) => {
    try {
      const { investmentId, transactionType, quantity, price } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!investmentId) {
        return res.status(400).json({ error: 'Investment ID is mandatory' });
      }

      if (transactionType !== 'BUY' && transactionType !== 'SELL') {
        return res.status(400).json({ error: 'Transaction type must be BUY or SELL' });
      }

      if (quantity === undefined || quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be greater than zero' });
      }

      if (price === undefined || price <= 0) {
        return res.status(400).json({ error: 'Price must be greater than zero' });
      }

      const transaction = await transactionService.createTransaction(userId, {
        investmentId,
        transactionType,
        quantity,
        price,
      });

      res.status(201).json(transaction);
    } catch (err: any) {
      if (err.message === 'Investment not found') {
        return res.status(404).json({ error: err.message });
      }
      if (err.message === 'Access denied to this investment') {
        return res.status(403).json({ error: err.message });
      }
      if (err.message === 'Insufficient quantity to sell') {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  });

  router.get('/', async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { startDate, endDate, transactionType, assetType } = req.query;

      const filters: {
        startDate?: Date;
        endDate?: Date;
        transactionType?: TransactionType;
        assetType?: AssetType;
      } = {};

      if (startDate) {
        filters.startDate = new Date(startDate as string);
      }
      if (endDate) {
        filters.endDate = new Date(endDate as string);
      }
      if (transactionType === 'BUY' || transactionType === 'SELL') {
        filters.transactionType = transactionType as TransactionType;
      }
      if (assetType === 'Stocks' || assetType === 'Bonds' || assetType === 'Mutual Funds') {
        filters.assetType = assetType as AssetType;
      }

      const transactions = await transactionService.getTransactions(userId, filters);
      res.status(200).json(transactions);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
