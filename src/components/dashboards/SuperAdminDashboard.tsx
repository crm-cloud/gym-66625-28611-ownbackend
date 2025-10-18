import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Users, DollarSign, MapPin, BarChart3, FileText, CreditCard, UserPlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/useCurrency';
import { Link } from 'react-router-dom';

export const SuperAdminDashboard = () => {
  // Fetch SaaS-level metrics
  const { data: gyms, isLoading: gymsLoading } = useQuery({
    queryKey: ['super-admin-gyms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: totalUsage, isLoading: usageLoading } = useQuery({
    queryKey: ['super-admin-usage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gym_usage')
        .select('*')
        .eq('month_year', new Date().toISOString().slice(0, 7) + '-01');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: subscriptionPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    }
  });

  const isLoading = gymsLoading || usageLoading || plansLoading;

  const { formatCurrency } = useCurrency();

  const totalRevenue = gyms?.reduce((acc, gym) => {
    const plan = subscriptionPlans?.find(p => p.name.toLowerCase() === gym.subscription_plan);
    return acc + (plan?.price || 0);
  }, 0) || 0;

  const totalBranches = totalUsage?.reduce((acc, usage) => acc + usage.branch_count, 0) || 0;
  const totalTrainers = totalUsage?.reduce((acc, usage) => acc + usage.trainer_count, 0) || 0;
  const totalMembers = totalUsage?.reduce((acc, usage) => acc + usage.member_count, 0) || 0;

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
              <div className="text-2xl font-bold">{gyms?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {gyms?.filter(g => g.status === 'active').length} active
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
                From {gyms?.filter(g => g.status === 'active').length} subscriptions
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
                    <p className="text-sm font-medium capitalize">{gym.status}</p>
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