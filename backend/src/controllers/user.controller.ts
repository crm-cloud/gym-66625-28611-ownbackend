import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { 
  createUserSchema, 
  updateUserSchema, 
  userQuerySchema,
  updateProfileSchema 
} from '../validation/user.validation';
import { ApiError } from '../middleware/errorHandler';

export class UserController {
  /**
   * Get all users
   */
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = userQuerySchema.parse({
        ...req.query,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 50,
        is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined
      });

      const result = await userService.getUsers(
        query,
        req.user!.role,
        req.user!.branchId
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(
        id,
        req.user!.role,
        req.user!.branchId
      );

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create user
   */
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createUserSchema.parse(req.body);
      const user = await userService.createUser(data, req.user!.role);

      res.status(201).json({
        message: 'User created successfully',
        user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateUserSchema.parse(req.body);
      
      const user = await userService.updateUser(
        id,
        data,
        req.user!.role,
        req.user!.branchId
      );

      res.json({
        message: 'User updated successfully',
        user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await userService.deleteUser(
        id,
        req.user!.role,
        req.user!.branchId
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update own profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateProfileSchema.parse(req.body);
      const user = await userService.updateProfile(req.user!.userId, data);

      res.json({
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { branch_id } = req.query;
      const stats = await userService.getUserStats(branch_id as string);

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get profiles (for super admin)
   */
  async getProfiles(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, is_active } = req.query;
      const profiles = await userService.getProfiles({
        role: role as string,
        is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined
      });
      res.json(profiles);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
