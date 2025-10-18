import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRBAC } from '@/hooks/useRBAC';
import { UserRole } from '@/types/auth';
import { Permission } from '@/types/rbac';

interface HasAccessProps {
  children: ReactNode;
  // Role-based access
  allowedRoles?: UserRole[];
  restrictToRoles?: UserRole[];
  teamRole?: string;
  excludeTeamRoles?: string[];
  // Permission-based access
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // If true, user must have ALL permissions; if false, user needs ANY permission
  // Resource-based access
  resource?: string;
  action?: string;
  // Branch-based access
  branchId?: string;
  // Fallback UI
  fallback?: ReactNode;
  // Show loading state
  showLoading?: boolean;
}

/**
 * HasAccess component provides fine-grained access control for UI elements.
 * 
 * Usage examples:
 * 
 * // Role-based access
 * <HasAccess allowedRoles={['admin', 'super-admin']}>
 *   <AdminButton />
 * </HasAccess>
 * 
 * // Permission-based access
 * <HasAccess permission="users.create">
 *   <CreateUserButton />
 * </HasAccess>
 * 
 * // Multiple permissions (any)
 * <HasAccess permissions={['users.edit', 'users.delete']}>
 *   <UserActions />
 * </HasAccess>
 * 
 * // Multiple permissions (all required)
 * <HasAccess permissions={['finance.view', 'finance.edit']} requireAll>
 *   <FinanceEditor />
 * </HasAccess>
 * 
 * // Team role specific
 * <HasAccess teamRole="trainer">
 *   <TrainerDashboard />
 * </HasAccess>
 * 
 * // Resource + action
 * <HasAccess resource="members" action="create">
 *   <AddMemberButton />
 * </HasAccess>
 * 
 * // With fallback
 * <HasAccess allowedRoles={['admin']} fallback={<div>Access denied</div>}>
 *   <AdminPanel />
 * </HasAccess>
 */
export const HasAccess = ({
  children,
  allowedRoles,
  restrictToRoles,
  teamRole,
  excludeTeamRoles,
  permission,
  permissions,
  requireAll = false,
  resource,
  action,
  branchId,
  fallback = null,
  showLoading = false
}: HasAccessProps) => {
  const { authState } = useAuth();
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    canAccessResource, 
    canAccessBranch 
  } = useRBAC();

  // Show loading state if authentication is still loading
  if (authState.isLoading && showLoading) {
    return (
      <div className="animate-pulse bg-muted/50 rounded h-8 w-24" />
    );
  }

  // Require authentication
  if (!authState.isAuthenticated || !authState.user) {
    return <>{fallback}</>;
  }

  const user = authState.user;

  // Role-based checks
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  if (restrictToRoles && !restrictToRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  // Team role checks
  if (teamRole && user.teamRole !== teamRole) {
    return <>{fallback}</>;
  }

  if (excludeTeamRoles && user.teamRole && excludeTeamRoles.includes(user.teamRole)) {
    return <>{fallback}</>;
  }

  // Permission-based checks
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (permissions && permissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }

  // Resource-based checks
  if (resource && action && !canAccessResource(resource, action)) {
    return <>{fallback}</>;
  }

  // Branch-based checks
  if (branchId && !canAccessBranch(branchId)) {
    return <>{fallback}</>;
  }

  // All checks passed, render children
  return <>{children}</>;
};

// Utility hook for conditional rendering based on access
export const useHasAccess = () => {
  const { authState } = useAuth();
  const rbac = useRBAC();

  return {
    ...rbac,
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    
    // Convenience methods
    hasRole: (role: UserRole) => authState.user?.role === role,
    hasAnyRole: (roles: UserRole[]) => authState.user ? roles.includes(authState.user.role) : false,
    hasTeamRole: (teamRole: string) => authState.user?.teamRole === teamRole,
    
    // Member-specific checks
    isMember: () => authState.user?.role === 'member',
    isStaff: () => authState.user?.teamRole === 'staff',
    isTrainer: () => authState.user?.teamRole === 'trainer',
    isManager: () => authState.user?.teamRole === 'manager',
    
    // Admin checks
    isAdmin: () => authState.user?.role === 'admin',
    isSuperAdmin: () => authState.user?.role === 'super-admin',
    isAdminOrAbove: () => authState.user ? ['admin', 'super-admin'].includes(authState.user.role) : false,
    
    // Team member checks (any role within team)
    isTeamMember: () => authState.user?.role === 'team',
  };
};