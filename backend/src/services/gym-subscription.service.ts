import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';

class GymSubscriptionService {
  async getAll(isActive?: boolean) {
    const where: any = {};
    if (isActive !== undefined) {
      where.is_active = isActive;
    }
    
    return await prisma.gym_subscriptions.findMany({
      where,
      orderBy: { created_at: 'desc' }
    });
  }
  
  async getById(id: string) {
    const plan = await prisma.gym_subscriptions.findUnique({
      where: { id }
    });
    
    if (!plan) {
      throw new ApiError('Subscription plan not found', 404);
    }
    
    return plan;
  }
  
  async create(data: any) {
    // Validate unique name
    const existing = await prisma.gym_subscriptions.findUnique({
      where: { name: data.name }
    });
    
    if (existing) {
      throw new ApiError('A plan with this name already exists', 409);
    }
    
    return await prisma.gym_subscriptions.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        billing_cycle: data.billing_cycle,
        max_branches: data.max_branches,
        max_trainers: data.max_trainers,
        max_members: data.max_members,
        features: data.features || [],
        is_active: data.is_active ?? true
      }
    });
  }
  
  async update(id: string, data: any) {
    await this.getById(id); // Check exists
    
    return await prisma.gym_subscriptions.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        billing_cycle: data.billing_cycle,
        max_branches: data.max_branches,
        max_trainers: data.max_trainers,
        max_members: data.max_members,
        features: data.features,
        is_active: data.is_active
      }
    });
  }
  
  async delete(id: string) {
    await this.getById(id); // Check exists
    
    // Soft delete by setting is_active = false
    await prisma.gym_subscriptions.update({
      where: { id },
      data: { is_active: false }
    });
  }
}

export const gymSubscriptionService = new GymSubscriptionService();
