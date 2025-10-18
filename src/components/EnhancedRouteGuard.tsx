import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRBAC } from '@/hooks/useRBAC';
import { UserRole } from '@/types/auth';
import { Permission } from '@/types/rbac';
import { PageLoadingState } from './LoadingState';
import { toast } from '@/hooks/use-toast';
import { getDefaultRouteForUser, isRouteAccessible } from '@/config/navigationConfig';

interface EnhancedRouteGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  requireAll?: boolean;
  teamRole?: string;
  excludeTeamRoles?: string[];
  redirectTo?: string;
  showUnauthorizedMessage?: boolean;
  // New props for enhanced functionality
  autoRedirect?: boolean; // If true, automatically redirect to user's default route
  silent?: boolean; // If true, don't show toast messages
  trackAccess?: boolean; // If true, log access attempts
}

export const EnhancedRouteGuard = ({
  children,
  allowedRoles,
  requiredPermissions,
  requireAll = false,
  teamRole,
  excludeTeamRoles,
  redirectTo,
  showUnauthorizedMessage = true,
  autoRedirect = true,
  silent = false,
  trackAccess = true
}: EnhancedRouteGuardProps) => {
  const { authState } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions, getUserPermissions } = useRBAC();
  const location = useLocation();

  useEffect(() => {
    // Track route access attempts for security audit
    if (trackAccess && authState.user) {
      console.log(`Route access: ${location.pathname} by ${authState.user.email} (${authState.user.role})`);
    }
  }, [location.pathname, authState.user, trackAccess]);

  // Show loading state while checking authentication
  if (authState.isLoading) {
    return <PageLoadingState />;
  }

  // Redirect to login if not authenticated
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const user = authState.user!;
  const userPermissions = getUserPermissions();

  // Check if user has access to this route using centralized config
  const hasRouteAccess = isRouteAccessible(
    location.pathname,
    user.role,
    userPermissions,
    user.teamRole
  );

  // If route is not in navigation config, apply manual checks
  let hasManualAccess = true;

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    hasManualAccess = false;
  }

  // Check team role specificity
  if (teamRole && user.teamRole !== teamRole) {
    hasManualAccess = false;
  }

  // Check excluded team roles
  if (excludeTeamRoles && user.teamRole && excludeTeamRoles.includes(user.teamRole)) {
    hasManualAccess = false;
  }

  // Check permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasRequiredPermissions) {
      hasManualAccess = false;
    }
  }

  // Determine final access
  const finalAccess = hasRouteAccess && hasManualAccess;

  if (!finalAccess) {
    // Show appropriate toast message
    if (showUnauthorizedMessage && !silent) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
    }

    // Determine where to redirect
    let redirectPath: string;

    if (redirectTo) {
      redirectPath = redirectTo;
    } else if (autoRedirect) {
      // Smart redirection based on user role
      redirectPath = getDefaultRouteForUser(user.role);
    } else {
      redirectPath = '/unauthorized';
    }

    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

// Higher-order component for route protection
export const withRouteGuard = (
  Component: React.ComponentType,
  guardProps: Omit<EnhancedRouteGuardProps, 'children'>
) => {
  return (props: any) => (
    <EnhancedRouteGuard {...guardProps}>
      <Component {...props} />
    </EnhancedRouteGuard>
  );
};

// Utility function to create protected routes
export const createProtectedRoute = (
  component: React.ComponentType,
  guardConfig: Omit<EnhancedRouteGuardProps, 'children'>
) => {
  return withRouteGuard(component, guardConfig);
};