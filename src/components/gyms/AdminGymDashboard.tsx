import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BranchCreationForm } from '@/components/branches/BranchCreationForm';
import { BranchForm } from '@/components/branches/BranchForm';
import { Building2, Plus, Users, MapPin, Settings, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export const AdminGymDashboard = () => {
  const [showGymForm, setShowGymForm] = useState(false);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [showEditBranchForm, setShowEditBranchForm] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState<any | null>(null);
  const queryClient = useQueryClient();
  const { authState } = useAuth();

  // Get admin's gym info
  const { data: gym, isLoading: gymLoading } = useQuery({
    queryKey: ['admin-gym', authState.user?.gym_id],
    queryFn: async () => {
      if (!authState.user?.gym_id) return null;
      
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .eq('id', authState.user.gym_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!authState.user?.gym_id,
  });

  // Get gym's branches
  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ['admin-branches', authState.user?.gym_id],
    queryFn: async () => {
      if (!authState.user?.gym_id) return [];
      
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('gym_id', authState.user.gym_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!authState.user?.gym_id,
  });

  // Get subscription plan details
  const { data: subscriptionPlan } = useQuery({
    queryKey: ['subscription-plan', gym?.subscription_plan],
    queryFn: async () => {
      if (!gym?.subscription_plan) return null;
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', gym.subscription_plan)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!gym?.subscription_plan,
  });

  const createGym = useMutation({
    mutationFn: async (data: any) => {
      const { data: newGym, error } = await supabase
        .from('gyms')
        .insert([{
          ...data,
          created_by: authState.user?.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Update admin's profile to link to the new gym
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ gym_id: newGym.id })
        .eq('user_id', authState.user?.id);
      
      if (profileError) throw profileError;
      
      return newGym;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Gym created successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['admin-gym'] });
      setShowGymForm(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (gymLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // If admin has no gym, show gym creation
  if (!gym) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Welcome to GymFit!</h2>
          <p className="text-muted-foreground mb-6">
            Let's get started by creating your gym. This will be your main business entity.
          </p>
          
          <Dialog open={showGymForm} onOpenChange={setShowGymForm}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Your First Branch</DialogTitle>
                <DialogDescription>
                  Set up your first branch location and details.
                </DialogDescription>
              </DialogHeader>
              <BranchCreationForm onSuccess={() => setShowGymForm(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  const canCreateMoreBranches = (branches?.length || 0) < (gym.max_branches || 1);
  const subscriptionUsage = {
    branches: { current: branches?.length || 0, max: gym.max_branches || 1 },
    trainers: { current: 0, max: gym.max_trainers || 5 }, // TODO: Get actual trainer count
    members: { current: 0, max: gym.max_members || 100 }, // TODO: Get actual member count
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{gym.name}</h1>
          <p className="text-muted-foreground">
            Admin Dashboard - Manage your gym and branches
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showBranchForm} onOpenChange={setShowBranchForm}>
            <DialogTrigger asChild>
              <Button disabled={!canCreateMoreBranches}>
                <Plus className="h-4 w-4 mr-2" />
                Add Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Branch</DialogTitle>
                <DialogDescription>
                  Add a new branch location to your gym network.
                </DialogDescription>
              </DialogHeader>
              <BranchForm onSuccess={() => setShowBranchForm(false)} />
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Subscription Status
            <Badge variant={gym.status === 'active' ? 'default' : 'destructive'}>
              {gym.status}
            </Badge>
          </CardTitle>
          <CardDescription>
            Current plan: {gym.subscription_plan} • ${subscriptionPlan?.price || 0}/{subscriptionPlan?.billing_cycle || 'month'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {subscriptionUsage.branches.current}/{subscriptionUsage.branches.max}
              </p>
              <p className="text-sm text-muted-foreground">Branches</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {subscriptionUsage.trainers.current}/{subscriptionUsage.trainers.max}
              </p>
              <p className="text-sm text-muted-foreground">Trainers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {subscriptionUsage.members.current}/{subscriptionUsage.members.max}
              </p>
              <p className="text-sm text-muted-foreground">Members</p>
            </div>
          </div>
          
          {!canCreateMoreBranches && (
            <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <p className="text-sm text-warning">
                You've reached your branch limit. Upgrade your subscription to add more branches.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Branches Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {branchesLoading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))
        ) : branches?.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Branches Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first branch to start managing locations.
              </p>
              <Button 
                onClick={() => setShowBranchForm(true)}
                disabled={!canCreateMoreBranches}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Branch
              </Button>
            </CardContent>
          </Card>
        ) : (
          branches?.map((branch) => (
            <Card key={branch.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {branch.name}
                </CardTitle>
                <CardDescription>
                  {(branch.address as any)?.city}, {(branch.address as any)?.state}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Capacity:</span>
                    <span>{branch.capacity} members</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Current:</span>
                    <span>{branch.current_members || 0} members</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Contact:</span>
                    <span>{(branch.contact as any)?.phone}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setBranchToEdit(branch);
                      setShowEditBranchForm(true);
                    }}
                  >
                    Manage Branch
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {/* Edit Branch Dialog */}
      <Dialog open={showEditBranchForm} onOpenChange={setShowEditBranchForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>
              Update branch details like name, contact, address, and capacity.
            </DialogDescription>
          </DialogHeader>
          {branchToEdit && (
            <BranchForm 
              branch={branchToEdit} 
              onSuccess={() => {
                setShowEditBranchForm(false);
                setBranchToEdit(null);
                queryClient.invalidateQueries({ queryKey: ['admin-branches'] });
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};