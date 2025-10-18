
import { ReactNode, Suspense } from 'react';
import { Permission } from '@/types/rbac';
import { useRBAC } from '@/hooks/useRBAC';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from './LoadingState';
import { ErrorBoundary } from './ErrorBoundary';

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  resource?: string;
  action?: string;
  allowedRoles?: string[];
  restrictToRoles?: string[];
  teamRole?: string;
  excludeTeamRoles?: string[];
  showLoader?: boolean;
  errorBoundary?: boolean;
}

export const PermissionGate = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  resource,
  action,
  allowedRoles,
  restrictToRoles,
  teamRole,
  excludeTeamRoles,
  showLoader = false,
  errorBoundary = false
}: PermissionGateProps) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, canAccessResource } = useRBAC();
  const { authState } = useAuth();

  // Show loading state if auth is still loading
  if (authState.isLoading && showLoader) {
    return <LoadingState text="Checking permissions..." />;
  }

  // If not authenticated, deny access
  if (!authState.isAuthenticated) {
    return <>{fallback}</>;
  }

  let hasAccess = true;

  // Check role-based access first
  if (allowedRoles && authState.user) {
    hasAccess = allowedRoles.includes(authState.user.role);
  }

  if (restrictToRoles && authState.user) {
    hasAccess = hasAccess && restrictToRoles.includes(authState.user.role);
  }

  // Check team role specificity
  if (teamRole && authState.user) {
    hasAccess = hasAccess && authState.user.teamRole === teamRole;
  }

  if (excludeTeamRoles && authState.user && authState.user.teamRole) {
    hasAccess = hasAccess && !excludeTeamRoles.includes(authState.user.teamRole);
  }

  // Then check permissions if access is still granted
  if (hasAccess) {
    try {
      if (resource && action) {
        hasAccess = canAccessResource(resource, action);
      } else if (permission) {
        hasAccess = hasPermission(permission);
      } else if (permissions) {
        hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
      }
    } catch (error) {
      console.error('Permission check failed:', error);
      hasAccess = false;
    }
  }

  const content = hasAccess ? <>{children}</> : <>{fallback}</>;

  if (errorBoundary) {
    return (
      <ErrorBoundary>
        {showLoader ? (
          <Suspense fallback={<LoadingState />}>
            {content}
          </Suspense>
        ) : (
          content
        )}
      </ErrorBoundary>
    );
  }

  return content;
};
