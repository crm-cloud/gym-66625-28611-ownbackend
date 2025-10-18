import { Request, Response, NextFunction } from 'express';
import { roleService } from '../services/role.service';
import { 
  createRoleSchema, 
  updateRoleSchema,
  assignPermissionsSchema,
  assignUserRoleSchema 
} from '../validation/role.validation';

export class RoleController {
  /**
   * Get all roles
   */
  async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await roleService.getRoles();
      res.json(roles);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get role by ID
   */
  async getRoleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const role = await roleService.getRoleById(id);
      res.json(role);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get role permissions
   */
  async getRolePermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const permissions = await roleService.getRolePermissions(id);
      res.json(permissions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all permissions grouped by module
   */
  async getPermissionsByModule(req: Request, res: Response, next: NextFunction) {
    try {
      const permissions = await roleService.getPermissionsByModule();
      res.json(permissions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create role
   */
  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createRoleSchema.parse(req.body);
      const role = await roleService.createRole(data);

      res.status(201).json({
        message: 'Role created successfully',
        role
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update role
   */
  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateRoleSchema.parse(req.body);
      const role = await roleService.updateRole(id, data);

      res.json({
        message: 'Role updated successfully',
        role
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete role
   */
  async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await roleService.deleteRole(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign permissions to role
   */
  async assignPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = assignPermissionsSchema.parse(req.body);
      const result = await roleService.assignPermissions(id, data);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign role to user
   */
  async assignUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const data = assignUserRoleSchema.parse(req.body);
      const result = await roleService.assignUserRole(data);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove role from user
   */
  async removeUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, roleId } = req.params;
      const result = await roleService.removeUserRole(userId, roleId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user roles
   */
  async getUserRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const roles = await roleService.getUserRoles(userId);

      res.json(roles);
    } catch (error) {
      next(error);
    }
  }
}

export const roleController = new RoleController();
