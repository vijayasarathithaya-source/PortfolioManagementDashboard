import { createApp } from './app.js';
import { bootstrapDatabase } from './infrastructure/database/bootstrap.js';
import {
  SqliteUserRepository,
  SqliteAssetRepository,
  SqliteInvestmentRepository,
  SqliteTransactionRepository
} from './infrastructure/repositories/sqlite.repository.js';

async function startServer() {
  const PORT = process.env.PORT || 3000;
  const DB_PATH = process.env.DB_PATH || './database.sqlite';

  try {
    console.log(`Bootstrapping database at: ${DB_PATH}...`);
    const db = await bootstrapDatabase(DB_PATH);
    console.log('Database bootstrapped successfully.');

    // Instantiate repositories with the database connection
    const userRepository = new SqliteUserRepository(db);
    const assetRepository = new SqliteAssetRepository(db);
    const investmentRepository = new SqliteInvestmentRepository(db);
    const transactionRepository = new SqliteTransactionRepository(db);

    // Create Express application with dependencies injected
    const app = createApp({
      userRepository,
      assetRepository,
      investmentRepository,
      transactionRepository,
    });

    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}. Shutting down server gracefully...`);
      server.close(async () => {
        console.log('HTTP server closed.');
        try {
          await db.close();
          console.log('Database connection closed.');
          process.exit(0);
        } catch (err) {
          console.error('Error closing database connection:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
