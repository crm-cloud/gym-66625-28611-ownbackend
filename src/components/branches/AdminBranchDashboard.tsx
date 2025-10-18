import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BranchCreationForm } from './BranchCreationForm';
import { BranchListTable } from './BranchListTable';
import { Building2, Plus, MapPin, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const AdminBranchDashboard = () => {
  const [showBranchForm, setShowBranchForm] = useState(false);
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

  if (gymLoading || authState.isLoading) {
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
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (branchesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  // Show empty state if no branches exist
  if (!branches || branches.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center py-12"
      >
        <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Branches Yet</h2>
        <p className="text-muted-foreground mb-6">
          Create your first branch to get started
        </p>
        <Button 
          onClick={() => setShowBranchForm(true)}
          className="mt-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create First Branch
        </Button>
      </motion.div>
    );
  }

  if (!gym || !authState.user?.gym_id) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center py-12"
      >
        <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Gym Found</h2>
        <p className="text-muted-foreground">
          Please contact support to set up your gym account.
        </p>
      </motion.div>
    );
  }

  const canCreateMoreBranches = (branches?.length || 0) < (gym.max_branches || 1);
  const totalMembers = branches?.reduce((sum, branch) => sum + (branch.current_members || 0), 0) || 0;
  const totalCapacity = branches?.reduce((sum, branch) => sum + (branch.capacity || 0), 0) || 0;
  const occupancyRate = totalCapacity > 0 ? Math.round((totalMembers / totalCapacity) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold text-foreground">{gym.name}</h1>
          <p className="text-muted-foreground">
            Branch Management Dashboard
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Dialog open={showBranchForm} onOpenChange={setShowBranchForm}>
            <DialogTrigger asChild>
              <Button disabled={!canCreateMoreBranches}>
                <Plus className="h-4 w-4 mr-2" />
                Create Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Branch</DialogTitle>
                <DialogDescription>
                  Add a new branch location to your gym network.
                </DialogDescription>
              </DialogHeader>
              <BranchCreationForm onSuccess={() => setShowBranchForm(false)} />
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>

      {/* Subscription Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Subscription Status
              <Badge variant={gym.status === 'active' ? 'default' : 'destructive'}>
                {gym.status}
              </Badge>
            </CardTitle>
            <CardDescription>
              Current plan: {gym.subscription_plan} 
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {branches?.length || 0}/{gym.max_branches || 1}
                </p>
                <p className="text-sm text-muted-foreground">Branches</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {totalMembers}/{gym.max_members || 100}
                </p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {occupancyRate}%
                </p>
                <p className="text-sm text-muted-foreground">Occupancy Rate</p>
              </div>
            </div>
            
            {!canCreateMoreBranches && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-center gap-2"
              >
                <AlertTriangle className="h-4 w-4 text-warning" />
                <p className="text-sm text-warning">
                  You've reached your branch limit. Upgrade your subscription to add more branches.
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Branches</CardTitle>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                {branchesLoading ? '...' : branches?.length || 0}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Active locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-secondary" />
              <span className="text-2xl font-bold text-foreground">
                {branchesLoading ? '...' : totalMembers}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Across all branches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Capacity</CardTitle>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="text-2xl font-bold text-foreground">
                {branchesLoading ? '...' : totalCapacity}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Maximum members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy Rate</CardTitle>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-2xl font-bold text-foreground">
                {branchesLoading ? '...' : `${occupancyRate}%`}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {occupancyRate >= 80 ? 'High utilization' : occupancyRate >= 60 ? 'Good utilization' : 'Room to grow'}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Branches Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Branches</CardTitle>
            <CardDescription>
              Manage your gym branches and locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {branchesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : branches?.length === 0 ? (
              <div className="text-center py-12">
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
              </div>
            ) : (
              <BranchListTable />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};