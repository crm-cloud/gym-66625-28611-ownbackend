import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { CreateRoleInput, UpdateRoleInput, AssignPermissionsInput, AssignUserRoleInput } from '../validation/role.validation';

export class RoleService {
  /**
   * Get all roles
   */
  async getRoles() {
    const roles = await prisma.$queryRaw`
      SELECT 
        r.id as role_id,
        r.name as role_name,
        r.display_name,
        r.description,
        r.color,
        r.is_system,
        r.created_at,
        COUNT(DISTINCT ur.user_id)::int as user_count,
        COUNT(DISTINCT rp.permission_id)::int as permission_count
      FROM roles r
      LEFT JOIN user_roles ur ON r.id = ur.role_id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      GROUP BY r.id, r.name, r.display_name, r.description, r.color, r.is_system, r.created_at
      ORDER BY r.created_at DESC
    `;

    return roles;
  }

  /**
   * Get role by ID
   */
  async getRoleById(id: string) {
    const role = await prisma.$queryRaw<any[]>`
      SELECT 
        r.id,
        r.name,
        r.display_name,
        r.description,
        r.color,
        r.is_system,
        r.created_at
      FROM roles r
      WHERE r.id = ${id}::uuid
      LIMIT 1
    `;

    if (!role || role.length === 0) {
      throw new ApiError('Role not found', 404);
    }

    return role[0];
  }

  /**
   * Get permissions for a role
   */
  async getRolePermissions(roleId: string) {
    const permissions = await prisma.$queryRaw`
      SELECT p.id, p.name, p.display_name, p.category, p.description
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ${roleId}::uuid
    `;

    return permissions;
  }

  /**
   * Get all permissions grouped by module
   */
  async getPermissionsByModule() {
    const permissions = await prisma.$queryRaw<any[]>`
      SELECT 
        p.module,
        json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'display_name', p.display_name,
            'category', p.category,
            'description', p.description
          )
        ) as permissions
      FROM permissions p
      GROUP BY p.module
      ORDER BY p.module
    `;

    return permissions;
  }

  /**
   * Create new role
   */
  async createRole(data: CreateRoleInput) {
    // Check if role name already exists
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM roles WHERE name = ${data.name} LIMIT 1
    `;

    if (existing && existing.length > 0) {
      throw new ApiError('Role with this name already exists', 400);
    }

    // Create role
    const roleId = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO roles (id, name, display_name, description, color, is_system)
      VALUES (${roleId}::uuid, ${data.name}, ${data.display_name}, ${data.description || null}, ${data.color || '#6366f1'}, ${data.is_system})
    `;

    // Assign permissions if provided
    if (data.permission_ids && data.permission_ids.length > 0) {
      await this.assignPermissions(roleId, { permission_ids: data.permission_ids });
    }

    return await this.getRoleById(roleId);
  }

  /**
   * Update role
   */
  async updateRole(id: string, data: UpdateRoleInput) {
    const role = await this.getRoleById(id);

    if (role.is_system) {
      throw new ApiError('Cannot modify system roles', 403);
    }

    await prisma.$executeRaw`
      UPDATE roles 
      SET 
        display_name = COALESCE(${data.display_name}, display_name),
        description = COALESCE(${data.description}, description),
        color = COALESCE(${data.color}, color),
        updated_at = NOW()
      WHERE id = ${id}::uuid
    `;

    return await this.getRoleById(id);
  }

  /**
   * Delete role
   */
  async deleteRole(id: string) {
    const role = await this.getRoleById(id);

    if (role.is_system) {
      throw new ApiError('Cannot delete system roles', 403);
    }

    // Check if role has users
    const userCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*)::int as count FROM user_roles WHERE role_id = ${id}::uuid
    `;

    if (userCount[0].count > 0) {
      throw new ApiError('Cannot delete role with assigned users', 400);
    }

    await prisma.$executeRaw`
      DELETE FROM roles WHERE id = ${id}::uuid
    `;

    return { message: 'Role deleted successfully' };
  }

  /**
   * Assign permissions to role
   */
  async assignPermissions(roleId: string, data: AssignPermissionsInput) {
    await this.getRoleById(roleId);

    // Delete existing permissions
    await prisma.$executeRaw`
      DELETE FROM role_permissions WHERE role_id = ${roleId}::uuid
    `;

    // Insert new permissions
    if (data.permission_ids.length > 0) {
      const values = data.permission_ids.map(permId => `('${roleId}', '${permId}')`).join(',');
      await prisma.$executeRawUnsafe(`
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES ${values}
      `);
    }

    return { message: 'Permissions updated successfully' };
  }

  /**
   * Assign role to user
   */
  async assignUserRole(data: AssignUserRoleInput) {
    const { user_id, role_id } = data;

    // Verify user exists
    const user = await prisma.profiles.findUnique({
      where: { user_id }
    });

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Verify role exists
    await this.getRoleById(role_id);

    // Check if user already has this role
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM user_roles 
      WHERE user_id = ${user_id}::uuid AND role_id = ${role_id}::uuid
      LIMIT 1
    `;

    if (existing && existing.length > 0) {
      throw new ApiError('User already has this role', 400);
    }

    // Assign role
    await prisma.$executeRaw`
      INSERT INTO user_roles (user_id, role_id)
      VALUES (${user_id}::uuid, ${role_id}::uuid)
    `;

    return { message: 'Role assigned successfully' };
  }

  /**
   * Remove role from user
   */
  async removeUserRole(userId: string, roleId: string) {
    await prisma.$executeRaw`
      DELETE FROM user_roles 
      WHERE user_id = ${userId}::uuid AND role_id = ${roleId}::uuid
    `;

    return { message: 'Role removed successfully' };
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string) {
    const roles = await prisma.$queryRaw`
      SELECT r.id, r.name, r.display_name, r.color
      FROM roles r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ${userId}::uuid
    `;

    return roles;
  }
}

export const roleService = new RoleService();
