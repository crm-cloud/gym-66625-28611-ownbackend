
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRBAC } from '@/hooks/useRBAC';
import { UserRole } from '@/types/auth';
import { Permission } from '@/types/rbac';
import { PageLoadingState } from './LoadingState';
import { toast } from '@/hooks/use-toast';

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  requireAll?: boolean;
  teamRole?: string;
  redirectTo?: string;
  showUnauthorizedMessage?: boolean;
}

export const RouteGuard = ({
  children,
  allowedRoles,
  requiredPermissions,
  requireAll = false,
  teamRole,
  redirectTo = '/unauthorized',
  showUnauthorizedMessage = true
}: RouteGuardProps) => {
  const { authState } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useRBAC();
  const location = useLocation();

  useEffect(() => {
    // Track route access attempts for security audit
    if (authState.user) {
      console.log(`Route access: ${location.pathname} by ${authState.user.email}`);
    }
  }, [location.pathname, authState.user]);

  // Show loading state while checking authentication
  if (authState.isLoading) {
    return <PageLoadingState />;
  }

  // Redirect to login if not authenticated
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && authState.user && !allowedRoles.includes(authState.user.role)) {
    if (showUnauthorizedMessage) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
    }
    return <Navigate to={redirectTo} replace />;
  }

  // Check team role specificity
  if (teamRole && authState.user?.teamRole !== teamRole) {
    if (showUnauthorizedMessage) {
      toast({
        title: "Access Denied",
        description: "This page is restricted to specific team roles.",
        variant: "destructive",
      });
    }
    return <Navigate to={redirectTo} replace />;
  }

  // Check permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasRequiredPermissions) {
      if (showUnauthorizedMessage) {
        toast({
          title: "Access Denied",
          description: "You don't have the required permissions to access this page.",
          variant: "destructive",
        });
      }
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
};
