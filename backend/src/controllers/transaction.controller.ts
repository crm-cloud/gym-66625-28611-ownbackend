import { Request, Response } from 'express';
import { transactionService } from '../services/transaction.service';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionFiltersSchema,
  createCategorySchema,
  updateCategorySchema
} from '../validation/transaction.validation';

export const transactionController = {
  async getTransactions(req: Request, res: Response) {
    try {
      const filters = transactionFiltersSchema.parse(req.query);
      const result = await transactionService.getTransactions(filters);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getTransaction(req: Request, res: Response) {
    try {
      const transaction = await transactionService.getTransactionById(req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.json(transaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createTransaction(req: Request, res: Response) {
    try {
      const data = createTransactionSchema.parse(req.body);
      const transaction = await transactionService.createTransaction(data);
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateTransaction(req: Request, res: Response) {
    try {
      const data = updateTransactionSchema.parse(req.body);
      const transaction = await transactionService.updateTransaction(req.params.id, data);
      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteTransaction(req: Request, res: Response) {
    try {
      await transactionService.deleteTransaction(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCategories(req: Request, res: Response) {
    try {
      const type = req.query.type as string;
      const categories = await transactionService.getCategories(type);
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createCategory(req: Request, res: Response) {
    try {
      const data = createCategorySchema.parse(req.body);
      const category = await transactionService.createCategory(data);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateCategory(req: Request, res: Response) {
    try {
      const data = updateCategorySchema.parse(req.body);
      const category = await transactionService.updateCategory(req.params.id, data);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};
