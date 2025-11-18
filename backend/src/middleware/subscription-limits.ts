import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from './errorHandler';

export function enforceSubscriptionLimits(resourceType: 'member' | 'branch' | 'trainer') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const gymId = req.user?.gymId || req.body.gym_id || req.query.gym_id;
      
      if (!gymId) {
        return next(); // Skip if no gym context
      }
      
      // Get gym with its subscription plan
      const gym = await prisma.gyms.findUnique({
        where: { id: gymId as string },
        include: {
          subscription_plans: true
        }
      });
      
      if (!gym) {
        throw new ApiError('Gym not found', 404);
      }
      
      if (!gym.subscription_plans) {
        console.warn(`[SubscriptionLimits] Gym ${gymId} has no active subscription plan`);
        return next(); // Allow if no plan assigned (grace period)
      }
      
      const limits = gym.subscription_plans;
      
      // Get current usage counts
      let currentCount = 0;
      let limitValue = 0;
      let limitName = '';
      
      switch (resourceType) {
        case 'member':
          currentCount = await prisma.members.count({
            where: { gym_id: gymId as string }
          });
          limitValue = limits.max_members || 0;
          limitName = 'member';
          break;
          
        case 'branch':
          currentCount = await prisma.branches.count({
            where: { gym_id: gymId as string }
          });
          limitValue = limits.max_branches || 0;
          limitName = 'branch';
          break;
          
        case 'trainer':
          currentCount = await prisma.trainers.count({
            where: { gym_id: gymId as string }
          });
          limitValue = limits.max_trainers || 0;
          limitName = 'trainer';
          break;
      }
      
      console.log(`[SubscriptionLimits] ${limitName} check for gym ${gymId}: ${currentCount}/${limitValue}`);
      
      if (currentCount >= limitValue) {
        throw new ApiError(
          `${limitName.charAt(0).toUpperCase() + limitName.slice(1)} limit reached (${limitValue}). Please upgrade your subscription plan to add more ${limitName}s.`,
          403
        );
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}
