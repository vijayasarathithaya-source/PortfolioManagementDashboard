import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { TransactionService } from '../../../src/application/services/transaction.service.js';
import type { CreateTransactionDto } from '../../../src/application/services/transaction.service.js';
import type { ITransactionRepository, IInvestmentRepository } from '../../../src/domain/repositories/interfaces.js';
import type { Investment, Transaction } from '../../../src/domain/entities.js';

describe('Transaction Service (TDD)', () => {
  let mockTransactionRepository: jest.Mocked<ITransactionRepository>;
  let mockInvestmentRepository: jest.Mocked<IInvestmentRepository>;
  let transactionService: TransactionService;
  const userId = 'user-uuid-123';

  beforeEach(() => {
    mockTransactionRepository = {
      findById: jest.fn(),
      findByInvestmentId: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
    };

    mockInvestmentRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    transactionService = new TransactionService(mockTransactionRepository, mockInvestmentRepository);
  });

  describe('createTransaction', () => {
    it('should successfully create a BUY transaction and update investment quantity', async () => {
      const mockInvestment: Investment = {
        id: 'investment-1',
        userId: userId,
        assetId: 'asset-uuid-1',
        quantity: 10,
        purchasePrice: 150,
        purchaseDate: new Date(),
      };

      const dto: CreateTransactionDto = {
        investmentId: 'investment-1',
        transactionType: 'BUY',
        quantity: 5,
        price: 160
      };

      mockInvestmentRepository.findById.mockResolvedValue(mockInvestment);
      
      const createdTransaction: Transaction = {
        id: 'transaction-1',
        investmentId: 'investment-1',
        transactionType: 'BUY',
        quantity: 5,
        price: 160,
        transactionDate: new Date()
      };
      mockTransactionRepository.create.mockResolvedValue(createdTransaction);

      const result = await transactionService.createTransaction(userId, dto);

      expect(result).toBe(createdTransaction);
      expect(mockInvestmentRepository.update).toHaveBeenCalledWith('investment-1', {
        quantity: 15, // 10 + 5
      });
    });

    it('should successfully create a SELL transaction and decrease investment quantity', async () => {
      const mockInvestment: Investment = {
        id: 'investment-1',
        userId: userId,
        assetId: 'asset-uuid-1',
        quantity: 10,
        purchasePrice: 150,
        purchaseDate: new Date(),
      };

      const dto: CreateTransactionDto = {
        investmentId: 'investment-1',
        transactionType: 'SELL',
        quantity: 4,
        price: 180
      };

      mockInvestmentRepository.findById.mockResolvedValue(mockInvestment);

      const createdTransaction: Transaction = {
        id: 'transaction-1',
        investmentId: 'investment-1',
        transactionType: 'SELL',
        quantity: 4,
        price: 180,
        transactionDate: new Date()
      };
      mockTransactionRepository.create.mockResolvedValue(createdTransaction);

      const result = await transactionService.createTransaction(userId, dto);

      expect(result).toBe(createdTransaction);
      expect(mockInvestmentRepository.update).toHaveBeenCalledWith('investment-1', {
        quantity: 6, // 10 - 4
      });
    });

    it('should fail to create transaction if the investment does not belong to the user', async () => {
      const otherUserInvestment: Investment = {
        id: 'investment-1',
        userId: 'some-other-user-uuid',
        assetId: 'asset-uuid-1',
        quantity: 10,
        purchasePrice: 150,
        purchaseDate: new Date(),
      };

      const dto: CreateTransactionDto = {
        investmentId: 'investment-1',
        transactionType: 'BUY',
        quantity: 5,
        price: 160
      };

      mockInvestmentRepository.findById.mockResolvedValue(otherUserInvestment);

      await expect(
        transactionService.createTransaction(userId, dto)
      ).rejects.toThrow('Access denied to this investment');
    });

    it('should fail to create a SELL transaction if selling quantity exceeds current quantity', async () => {
      const mockInvestment: Investment = {
        id: 'investment-1',
        userId: userId,
        assetId: 'asset-uuid-1',
        quantity: 10,
        purchasePrice: 150,
        purchaseDate: new Date(),
      };

      const dto: CreateTransactionDto = {
        investmentId: 'investment-1',
        transactionType: 'SELL',
        quantity: 12, // Exceeds 10
        price: 180
      };

      mockInvestmentRepository.findById.mockResolvedValue(mockInvestment);

      await expect(
        transactionService.createTransaction(userId, dto)
      ).rejects.toThrow('Insufficient quantity to sell');
    });
  });
});
