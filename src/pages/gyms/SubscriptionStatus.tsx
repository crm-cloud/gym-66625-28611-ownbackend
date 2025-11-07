import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { PageLoadingState } from '@/components/LoadingState';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'cancelled' | 'expired';

interface SubscriptionData {
  id: string;
  status: SubscriptionStatus;
  planName: string;
  currentPeriodEnd: string;
  maxBranches: number;
  maxTrainers: number;
  maxMembers: number;
  isTrial: boolean;
  daysUntilRenewal: number;
}

export default function SubscriptionStatus() {
  const { authState } = useAuth();
  const navigate = useNavigate();

  const { data: subscription, isLoading, error } = useQuery<SubscriptionData>({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const { data } = await api.get('/api/subscriptions/status');
      return data;
    },
    enabled: !!authState.user?.id,
  });

  const getStatusBadge = (status: SubscriptionStatus) => {
    const statusMap = {
      active: { label: 'Active', variant: 'default' as const },
      trial: { label: 'Trial', variant: 'secondary' as const },
      past_due: { label: 'Past Due', variant: 'destructive' as const },
      cancelled: { label: 'Cancelled', variant: 'outline' as const },
      expired: { label: 'Expired', variant: 'destructive' as const },
    };

    const { label, variant } = statusMap[status] || { label: 'Unknown', variant: 'outline' as const };
    return <Badge variant={variant} className="capitalize">{label}</Badge>;
  };

  const handleUpgrade = () => {
    navigate('/subscription-plans');
  };

  if (isLoading) {
    return <PageLoadingState />;
  }

  if (error || !subscription) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              Subscription Not Found
            </CardTitle>
            <CardDescription>
              You don't have an active subscription. Please choose a plan to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleUpgrade}>
              <CreditCard className="mr-2 h-4 w-4" />
              View Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isActive = ['active', 'trial'].includes(subscription.status);
  const isExpired = ['cancelled', 'expired'].includes(subscription.status);
  const isPastDue = subscription.status === 'past_due';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subscription Status</h1>
          <p className="text-muted-foreground">Manage your gym's subscription plan</p>
        </div>
        {!isActive && (
          <Button onClick={handleUpgrade}>
            <CreditCard className="mr-2 h-4 w-4" />
            {isExpired ? 'Renew Subscription' : 'Upgrade Plan'}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {subscription.planName}
                {getStatusBadge(subscription.status)}
              </CardTitle>
              <CardDescription>
                {isActive ? (
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {subscription.isTrial ? 'Trial active' : 'Subscription active'}
                  </span>
                ) : isPastDue ? (
                  <span className="text-amber-600 dark:text-amber-400">
                    Payment required to maintain access
                  </span>
                ) : (
                  <span className="text-destructive">
                    Subscription {subscription.status}. Please renew to continue using all features.
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Plan</p>
              <p className="font-medium">{subscription.planName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div>{getStatusBadge(subscription.status)}</div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {isExpired ? 'Expired On' : 'Next Billing Date'}
              </p>
              <p className="font-medium">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Plan Limits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Branches</p>
                <p className="font-medium">{subscription.maxBranches} max</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Trainers</p>
                <p className="font-medium">{subscription.maxTrainers} max</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Members</p>
                <p className="font-medium">{subscription.maxMembers} max</p>
              </div>
            </div>
          </div>

          {isPastDue && (
            <div className="bg-destructive/10 p-4 rounded-md border border-destructive/20">
              <h4 className="font-medium text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Payment Required
              </h4>
              <p className="text-sm mt-1">
                Your subscription payment is past due. Please update your payment method to avoid service interruption.
              </p>
              <Button variant="destructive" size="sm" className="mt-3">
                Update Payment Method
              </Button>
            </div>
          )}

          {subscription.isTrial && (
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-700 dark:text-blue-300">Trial Period Active</h4>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Your trial will end in {subscription.daysUntilRenewal} days. Choose a plan before it ends to continue without interruption.
              </p>
              <Button variant="outline" size="sm" className="mt-3 border-blue-300 dark:border-blue-700">
                View Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
