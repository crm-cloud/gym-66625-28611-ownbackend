import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Building2, Mail, Phone, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AdminAccountForm } from '@/components/users/AdminAccountForm';
import { SuperAdminAdvancedAnalytics } from '@/components/dashboards/SuperAdminAdvancedAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdminProfile {
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  gym_id: string;
  is_active: boolean;
  created_at: string;
  gyms?: {
    name: string;
    subscription_plan: string;
  };
}

export default function AdminManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: adminProfiles = [], isLoading } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          gyms!profiles_gym_id_fkey (
            name,
            subscription_plan
          )
        `)
        .eq('role', 'admin')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AdminProfile[];
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data: gyms, error: gymsError } = await supabase
        .from('gyms')
        .select('id')
        .eq('status', 'active');

      const { data: branches, error: branchesError } = await supabase
        .from('branches')
        .select('id, gym_id')
        .eq('status', 'active');

      if (gymsError || branchesError) throw gymsError || branchesError;

      return {
        totalGyms: gyms?.length || 0,
        totalBranches: branches?.length || 0,
        totalAdmins: adminProfiles.length,
      };
    },
    enabled: adminProfiles.length > 0
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <p className="text-muted-foreground">Create and manage gym admin accounts with advanced analytics</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Admin Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Admin Account</DialogTitle>
              <DialogDescription>
                Create a new gym admin account with their personal details, address, and gym assignment. Location can be auto-fetched.
              </DialogDescription>
            </DialogHeader>
            <AdminAccountForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="accounts">Admin Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Admins</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{adminProfiles.length}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Active admin accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Gyms</CardTitle>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold text-foreground">{stats?.totalGyms || 0}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Active gym accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Branches</CardTitle>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-secondary" />
              <span className="text-2xl font-bold text-foreground">{stats?.totalBranches || 0}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Across all gyms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Coverage</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">
                {stats?.totalGyms ? Math.round((adminProfiles.length / stats.totalGyms) * 100) : 0}%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Gyms with admins</p>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="analytics">
          <SuperAdminAdvancedAnalytics />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          {/* Admin Profiles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adminProfiles.map((admin) => (
          <Card key={admin.user_id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{admin.full_name}</CardTitle>
                  <CardDescription className="text-sm">
                    Admin • Created {new Date(admin.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge variant={admin.is_active ? 'default' : 'secondary'}>
                  {admin.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{admin.email}</span>
                </div>
                {admin.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{admin.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{admin.gyms?.name || 'No gym assigned'}</span>
                </div>
              </div>

              {admin.gyms && (
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Subscription</span>
                    <Badge variant="outline" className="text-xs">
                      {admin.gyms.subscription_plan}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {adminProfiles.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-muted rounded-full mx-auto flex items-center justify-center">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No Admin Accounts</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Get started by creating your first gym admin account. Admins can manage their gym's branches and operations.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create First Admin Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
        </TabsContent>
      </Tabs>
    </div>
  );
}