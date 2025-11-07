
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRBAC } from '@/hooks/useRBAC';
import { UserRole } from '@/types/auth';
import { Permission } from '@/types/rbac';
import { PageLoadingState } from './LoadingState';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/axios';

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  requireAll?: boolean;
  teamRole?: string;
  redirectTo?: string;
  showUnauthorizedMessage?: boolean;
  checkSubscription?: boolean;
  requiredSubscriptionStatus?: 'active' | 'trial' | 'past_due' | 'cancelled' | 'expired';
}

export const RouteGuard = ({
  children,
  allowedRoles,
  requiredPermissions,
  requireAll = false,
  teamRole,
  redirectTo = '/unauthorized',
  showUnauthorizedMessage = true,
  checkSubscription = false,
  requiredSubscriptionStatus = 'active'
}: RouteGuardProps) => {
  const { authState } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useRBAC();
  const location = useLocation();
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    status?: string;
    isValid: boolean;
    isLoading: boolean;
  }>({ status: undefined, isValid: false, isLoading: false });

  useEffect(() => {
    // Track route access attempts for security audit
    if (authState.user) {
      console.log(`Route access: ${location.pathname} by ${authState.user.email}`);
    }
  }, [location.pathname, authState.user]);

  // Check subscription status if required
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!checkSubscription || !authState.user?.id) return;
      
      setSubscriptionStatus(prev => ({ ...prev, isLoading: true }));
      
      try {
        const { data } = await api.get('/api/subscriptions/status');
        const isValid = data?.status === requiredSubscriptionStatus;
        setSubscriptionStatus({
          status: data?.status,
          isValid,
          isLoading: false
        });
        
        if (!isValid && showUnauthorizedMessage) {
          toast({
            title: 'Subscription Required',
            description: 'An active subscription is required to access this feature.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setSubscriptionStatus({
          status: undefined,
          isValid: false,
          isLoading: false
        });
      }
    };
    
    if (checkSubscription) {
      checkSubscriptionStatus();
    }
  }, [checkSubscription, authState.user?.id, requiredSubscriptionStatus, showUnauthorizedMessage]);

  // Show loading state while checking authentication or subscription
  if (authState.isLoading || (checkSubscription && subscriptionStatus.isLoading)) {
    return <PageLoadingState />;
  }
  
  // If subscription check is required and failed, redirect to subscription page
  if (checkSubscription && !subscriptionStatus.isValid && authState.isAuthenticated) {
    return <Navigate to="/gym/subscription" state={{ from: location }} replace />;
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
