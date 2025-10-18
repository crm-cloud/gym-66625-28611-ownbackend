import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const orderService = {
  async getOrders(filters: any) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.user_id) where.user_id = filters.user_id;
    if (filters.status) where.status = filters.status;
    if (filters.branch_id) where.branch_id = filters.branch_id;
    if (filters.start_date || filters.end_date) {
      where.created_at = {};
      if (filters.start_date) where.created_at.gte = new Date(filters.start_date);
      if (filters.end_date) where.created_at.lte = new Date(filters.end_date);
    }

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { order_items: { include: { products: true } } }
      }),
      prisma.orders.count({ where })
    ]);

    return { orders, total, page, limit };
  },

  async getOrderById(id: string) {
    return await prisma.orders.findUnique({
      where: { id },
      include: { order_items: { include: { products: true } } }
    });
  },

  async createOrder(userId: string, data: any) {
    const totalAmount = data.order_items.reduce(
      (sum: number, item: any) => sum + item.unit_price * item.quantity,
      0
    );

    // Generate order number
    const count = await prisma.orders.count();
    const orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`;

    return await prisma.$transaction(async (tx) => {
      const order = await tx.orders.create({
        data: {
          order_number: orderNumber,
          user_id: data.user_id || userId,
          total_amount: totalAmount,
          cash_amount: data.cash_amount || 0,
          credit_used: data.credit_used || 0,
          payment_method: data.payment_method,
          payment_reference: data.payment_reference,
          status: 'completed',
          branch_id: data.branch_id
        }
      });

      await tx.order_items.createMany({
        data: data.order_items.map((item: any) => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.unit_price * item.quantity
        }))
      });

      // Update product stock
      for (const item of data.order_items) {
        await tx.products.update({
          where: { id: item.product_id },
          data: { stock_quantity: { decrement: item.quantity } }
        });
      }

      return order;
    });
  },

  async updateOrder(id: string, data: any) {
    return await prisma.orders.update({ where: { id }, data });
  }
};
