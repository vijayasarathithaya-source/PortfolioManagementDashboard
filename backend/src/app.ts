import express from 'express';
import cors from 'cors';
import path from 'path';
import type { IUserRepository, IInvestmentRepository, ITransactionRepository, IAssetRepository } from './domain/repositories/interfaces';
import { createAuthRouter } from './presentation/controllers/auth.controller';
import { createInvestmentRouter } from './presentation/controllers/investment.controller';
import { createTransactionRouter } from './presentation/controllers/transaction.controller';
import { createAssetRouter } from './presentation/controllers/asset.controller';
import { createPortfolioRouter } from './presentation/controllers/portfolio.controller';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './presentation/swagger';
import { EnvConfig } from './infrastructure/config/env.config';

interface AppDependencies {
  userRepository: IUserRepository;
  assetRepository: IAssetRepository;
  investmentRepository: IInvestmentRepository;
  transactionRepository: ITransactionRepository;
}

export function createApp(dependencies: AppDependencies): express.Application {
  const app = express();


  app.use(cors({
    origin: EnvConfig.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
  app.use(express.json());

  app.use(express.static(path.resolve('public')));

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use('/api/auth', createAuthRouter(dependencies.userRepository));
  app.use('/api/assets', createAssetRouter(dependencies.assetRepository));
  app.use('/api/investments', createInvestmentRouter(dependencies.investmentRepository));
  app.use('/api/transactions', createTransactionRouter(dependencies.transactionRepository, dependencies.investmentRepository));
  app.use('/api/portfolio', createPortfolioRouter(dependencies.investmentRepository, dependencies.assetRepository));

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  });

  return app;
}
