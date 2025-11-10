import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, DollarSign, MapPin, BarChart3, FileText, CreditCard, UserPlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/useCurrency';
import { useDashboardStats } from '@/hooks/useAnalytics';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { Link } from 'react-router-dom';

export const SuperAdminDashboard = () => {
  // Fetch platform-level metrics using REST API
  const { data: dashboardStats, isLoading } = useDashboardStats();
  const { data: subscriptionPlans = [] } = useSystemSettings('subscription');

  const { formatCurrency } = useCurrency();

  const totalRevenue = dashboardStats?.monthlyRevenue || 0;
  const totalBranches = dashboardStats?.totalBranches || 0;
  const totalTrainers = dashboardStats?.totalTrainers || 0;
  const totalMembers = dashboardStats?.totalMembers || 0;
  const gyms = dashboardStats?.recentGyms || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">SaaS Platform Overview</h2>
          <p className="text-muted-foreground">
            Monitor platform-wide metrics and manage gym tenants
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/users/admin-management">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Admin
            </Button>
          </Link>
          <Link to="/platform-analytics">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* SaaS Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/gyms">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gyms</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.totalGyms || 0}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats?.activeGyms || 0} active
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/platform-analytics">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                From {dashboardStats?.activeGyms || 0} subscriptions
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/branches/admin">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBranches}</div>
              <p className="text-xs text-muted-foreground">
                Across all gym clients
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/users/admin-management">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrainers + totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                {totalTrainers} trainers, {totalMembers} members
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Gyms and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Gyms</CardTitle>
            <CardDescription>
              Latest gym registrations on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gyms?.slice(0, 5).map((gym) => (
                <div key={gym.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{gym.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {gym.subscription_plan} plan
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{gym.branch_count} branches, {gym.member_count} members</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(gym.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common platform management tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/gyms" className="block">
              <Button className="w-full justify-start" variant="default">
                <Building2 className="h-4 w-4 mr-2" />
                Gym Management
              </Button>
            </Link>
            <Link to="/users/admin-management" className="block">
              <Button className="w-full justify-start" variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Admin Management
              </Button>
            </Link>
            <Link to="/platform-analytics" className="block">
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Platform Analytics
              </Button>
            </Link>
            <Link to="/platform-reports" className="block">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Platform Reports
              </Button>
            </Link>
            <Link to="/subscription-plans" className="block">
              <Button className="w-full justify-start" variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Subscription Plans
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};