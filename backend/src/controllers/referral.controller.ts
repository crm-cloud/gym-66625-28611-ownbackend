import { Request, Response } from 'express';
import { referralService } from '../services/referral.service';
import {
  createReferralSchema,
  updateReferralSchema,
  referralFiltersSchema,
  createRewardSchema,
  updateRewardSchema
} from '../validation/referral.validation';

export const referralController = {
  // Referrals
  async getReferrals(req: Request, res: Response) {
    try {
      const filters = referralFiltersSchema.parse(req.query);
      const result = await referralService.getReferrals(filters);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getReferral(req: Request, res: Response) {
    try {
      const referral = await referralService.getReferralById(req.params.id);
      if (!referral) {
        return res.status(404).json({ error: 'Referral not found' });
      }
      res.json(referral);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createReferral(req: Request, res: Response) {
    try {
      const data = createReferralSchema.parse(req.body);
      const referral = await referralService.createReferral(data);
      res.status(201).json(referral);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateReferral(req: Request, res: Response) {
    try {
      const data = updateReferralSchema.parse(req.body);
      const referral = await referralService.updateReferral(req.params.id, data);
      res.json(referral);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Rewards
  async getRewards(req: Request, res: Response) {
    try {
      const userId = req.query.user_id as string;
      const rewards = await referralService.getRewards(userId);
      res.json(rewards);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getReward(req: Request, res: Response) {
    try {
      const reward = await referralService.getRewardById(req.params.id);
      if (!reward) {
        return res.status(404).json({ error: 'Reward not found' });
      }
      res.json(reward);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createReward(req: Request, res: Response) {
    try {
      const data = createRewardSchema.parse(req.body);
      const reward = await referralService.createReward(data);
      res.status(201).json(reward);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateReward(req: Request, res: Response) {
    try {
      const data = updateRewardSchema.parse(req.body);
      const reward = await referralService.updateReward(req.params.id, data);
      res.json(reward);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};
