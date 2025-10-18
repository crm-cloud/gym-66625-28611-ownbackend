import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { GymForm } from '@/components/gyms/GymForm';
import { Building2, Users, MapPin, TrendingUp, MoreVertical, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface Gym {
  id: string;
  name: string;
  subscription_plan: string;
  status: string;
  max_branches: number;
  max_trainers: number;
  max_members: number;
  billing_email: string;
  created_at: string;
}

export default function GymManagement() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const queryClient = useQueryClient();

  // Fetch gyms
  const { data: gyms, isLoading } = useQuery({
    queryKey: ['gyms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Gym[];
    }
  });

  // Fetch gym usage statistics
  const { data: gymUsage } = useQuery({
    queryKey: ['gym-usage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gym_usage')
        .select('*')
        .order('month_year', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Delete/Deactivate gym mutation
  const deleteGym = useMutation({
    mutationFn: async (gymId: string) => {
      const { error } = await supabase
        .from('gyms')
        .update({ status: 'inactive' })
        .eq('id', gymId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Gym deactivated successfully' });
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Helper to get usage data for a gym
  const getUsageForGym = (gymId: string) => {
    if (!gymUsage) return null;
    const latestUsage = gymUsage.find((u) => u.gym_id === gymId);
    return latestUsage;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    const planLower = plan.toLowerCase();
    switch (planLower) {
      case 'enterprise': return 'default';
      case 'pro': return 'secondary';
      case 'basic': return 'outline';
      default: return 'outline';
    }
  };

  const handleEdit = (gym: Gym) => {
    setSelectedGym(gym);
    setDrawerOpen(true);
  };

  const handleAddNew = () => {
    setSelectedGym(null);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedGym(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gym Management</h1>
          <p className="text-muted-foreground mt-1">Manage all gyms on the platform</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Gym
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gyms?.map((gym) => {
          const usage = getUsageForGym(gym.id);
          
          return (
            <Card key={gym.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {gym.name}
                    </CardTitle>
                    <CardDescription>{gym.billing_email}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(gym)}>
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/branches/admin?gym_id=${gym.id}`}>
                          Manage Admins
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => deleteGym.mutate(gym.id)}
                        className="text-destructive"
                      >
                        Deactivate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant={getStatusBadgeVariant(gym.status)}>
                    {gym.status}
                  </Badge>
                  <Badge variant={getPlanBadgeVariant(gym.subscription_plan)}>
                    {gym.subscription_plan}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Branches
                    </div>
                    <div className="text-2xl font-bold">
                      {usage?.branch_count || 0} / {gym.max_branches}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Members
                    </div>
                    <div className="text-2xl font-bold">
                      {usage?.member_count || 0} / {gym.max_members}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Trainers
                  </div>
                  <div className="text-2xl font-bold">
                    {usage?.trainer_count || 0} / {gym.max_trainers}
                  </div>
                </div>

                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Created: {new Date(gym.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{selectedGym ? 'Edit Gym' : 'Add New Gym'}</DrawerTitle>
            <DrawerDescription>
              {selectedGym ? 'Update gym details and subscription plan' : 'Create a new gym on the platform'}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-6">
            <GymForm gym={selectedGym} onSuccess={handleCloseDrawer} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
