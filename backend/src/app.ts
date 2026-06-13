import express from 'express';
import type { IUserRepository, IInvestmentRepository, ITransactionRepository, IAssetRepository } from './domain/repositories/interfaces.js';
import { createAuthRouter } from './presentation/controllers/auth.controller.js';
import { createInvestmentRouter } from './presentation/controllers/investment.controller.js';
import { createTransactionRouter } from './presentation/controllers/transaction.controller.js';
import { createAssetRouter } from './presentation/controllers/asset.controller.js';

interface AppDependencies {
  userRepository: IUserRepository;
  assetRepository: IAssetRepository;
  investmentRepository: IInvestmentRepository;
  transactionRepository: ITransactionRepository;
}

export function createApp(dependencies: AppDependencies): express.Application {
  const app = express();
  app.use(express.json());

  app.use('/api/auth', createAuthRouter(dependencies.userRepository));
  app.use('/api/assets', createAssetRouter(dependencies.assetRepository));
  app.use('/api/investments', createInvestmentRouter(dependencies.investmentRepository));
  app.use('/api/transactions', createTransactionRouter(dependencies.transactionRepository));

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  });

  return app;
}
