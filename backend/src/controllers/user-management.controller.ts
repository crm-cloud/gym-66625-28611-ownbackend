import { Request, Response } from 'express';
import { userManagementService } from '../services/user-management.service';

class UserManagementController {
  /**
   * Create user with role
   */
  async createUser(req: Request, res: Response) {
    try {
      const result = await userManagementService.createUserWithRole(req.body);
      
      if (result.error) {
        return res.status(400).json({
          success: false,
          error: result.error.message
        });
      }

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          profile: result.profile
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create user'
      });
    }
  }

  /**
   * Enable login for existing member
   */
  async enableMemberLogin(req: Request, res: Response) {
    try {
      const { memberId } = req.params;
      const { email, full_name, password, branch_id } = req.body;

      const result = await userManagementService.enableMemberLogin(
        memberId,
        email,
        full_name,
        password,
        branch_id
      );

      if (result.error) {
        return res.status(400).json({
          success: false,
          error: result.error.message
        });
      }

      res.json({
        success: true,
        data: {
          user: result.user,
          profile: result.profile
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to enable member login'
      });
    }
  }

  /**
   * Generate temporary password
   */
  async generateTempPassword(req: Request, res: Response) {
    try {
      const password = userManagementService.generateTempPassword();
      
      res.json({
        success: true,
        data: { password }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate password'
      });
    }
  }
}

export const userManagementController = new UserManagementController();
