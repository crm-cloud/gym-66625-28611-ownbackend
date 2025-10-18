import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const transactionService = {
  async getTransactions(filters: any) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;
    if (filters.branch_id) where.branch_id = filters.branch_id;
    if (filters.start_date || filters.end_date) {
      where.transaction_date = {};
      if (filters.start_date) where.transaction_date.gte = new Date(filters.start_date);
      if (filters.end_date) where.transaction_date.lte = new Date(filters.end_date);
    }

    const [transactions, total] = await Promise.all([
      prisma.financial_transactions.findMany({
        where,
        skip,
        take: limit,
        orderBy: { transaction_date: 'desc' }
      }),
      prisma.financial_transactions.count({ where })
    ]);

    return { transactions, total, page, limit };
  },

  async getTransactionById(id: string) {
    return await prisma.financial_transactions.findUnique({ where: { id } });
  },

  async createTransaction(data: any) {
    return await prisma.financial_transactions.create({ data });
  },

  async updateTransaction(id: string, data: any) {
    return await prisma.financial_transactions.update({ where: { id }, data });
  },

  async deleteTransaction(id: string) {
    return await prisma.financial_transactions.delete({ where: { id } });
  },

  async getCategories(type?: string) {
    const where: any = { is_active: true };
    if (type) where.type = type;
    return await prisma.transaction_categories.findMany({ where });
  },

  async createCategory(data: any) {
    return await prisma.transaction_categories.create({ data });
  },

  async updateCategory(id: string, data: any) {
    return await prisma.transaction_categories.update({ where: { id }, data });
  }
};
