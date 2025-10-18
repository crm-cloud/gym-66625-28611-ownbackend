import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const productService = {
  async getProducts(filters: any) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.category) where.category = filters.category;
    if (filters.branch_id) where.branch_id = filters.branch_id;
    if (filters.is_active !== undefined) where.is_active = filters.is_active;
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.products.count({ where })
    ]);

    return { products, total, page, limit };
  },

  async getProductById(id: string) {
    return await prisma.products.findUnique({ where: { id } });
  },

  async createProduct(data: any) {
    return await prisma.products.create({ data });
  },

  async updateProduct(id: string, data: any) {
    return await prisma.products.update({ where: { id }, data });
  },

  async deleteProduct(id: string) {
    return await prisma.products.delete({ where: { id } });
  }
};
