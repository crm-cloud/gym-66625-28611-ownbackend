import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/axios';
import { toast } from '@/hooks/use-toast';
import { PageLoadingState } from '@/components/LoadingState';
import { Building, CreditCard, X, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminSubscriptions() {
  const queryClient = useQueryClient();
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  
  const { data: admins, isLoading: loadingAdmins } = useQuery({
    queryKey: ['admins-for-subscription'],
    queryFn: async () => {
      const { data } = await api.get('/api/users', {
        params: { role: 'admin' }
      });
      return data;
    }
  });
  
  const { data: plans, isLoading: loadingPlans } = useQuery({
    queryKey: ['subscription-plans-active'],
    queryFn: async () => {
      const { data } = await api.get('/api/gym-subscriptions', {
        params: { is_active: true }
      });
      return data;
    }
  });
  
  const { data: subscriptions, isLoading: loadingSubscriptions } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin-subscriptions');
      return data;
    }
  });
  
  const assignMutation = useMutation({
    mutationFn: async (data: { admin_id: string; subscription_plan_id: string }) => {
      const response = await api.post('/api/admin-subscriptions', data);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: 'Subscription assigned successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admins-for-subscription'] });
      setSelectedAdmin('');
      setSelectedPlan('');
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Failed to assign subscription',
        variant: 'destructive' 
      });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/admin-subscriptions/${id}`, {
        data: { reason: 'Cancelled by super admin' }
      });
      return response.data;
    },
    onSuccess: () => {
      toast({ title: 'Subscription cancelled successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      setCancellingId(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Failed to cancel subscription',
        variant: 'destructive' 
      });
      setCancellingId(null);
    }
  });
  
  const handleAssign = () => {
    if (!selectedAdmin || !selectedPlan) {
      toast({ 
        title: 'Validation Error', 
        description: 'Please select both admin and plan', 
        variant: 'destructive' 
      });
      return;
    }
    
    assignMutation.mutate({
      admin_id: selectedAdmin,
      subscription_plan_id: selectedPlan
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      cancelled: 'destructive',
      expired: 'secondary'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  if (loadingAdmins || loadingPlans || loadingSubscriptions) {
    return <PageLoadingState />;
  }

  const activeSubscriptionAdminIds = new Set(
    subscriptions?.filter((s: any) => s.status === 'active').map((s: any) => s.admin_id) || []
  );
  const availableAdmins = admins?.filter((admin: any) => 
    !activeSubscriptionAdminIds.has(admin.user_id)
  ) || [];
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Subscription Management</h1>
        <p className="text-muted-foreground mt-2">
          Assign and manage subscription plans for gym administrators
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Assign Subscription to Admin
          </CardTitle>
          <CardDescription>
            Select an admin and subscription plan to assign
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Admin</label>
              <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose admin..." />
                </SelectTrigger>
                <SelectContent>
                  {availableAdmins.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No admins available (all have active subscriptions)
                    </div>
                  ) : (
                    availableAdmins.map((admin: any) => (
                      <SelectItem key={admin.user_id} value={admin.user_id}>
                        {admin.full_name || admin.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Select Plan</label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose plan..." />
                </SelectTrigger>
                <SelectContent>
                  {plans?.map((plan: any) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {plan.price} / {plan.billing_cycle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleAssign} 
            disabled={assignMutation.isPending || !selectedAdmin || !selectedPlan}
            className="w-full md:w-auto"
          >
            {assignMutation.isPending ? 'Assigning...' : 'Assign Subscription'}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Active Subscriptions
          </CardTitle>
          <CardDescription>
            Manage existing admin subscription assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!subscriptions || subscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No subscriptions assigned yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Billing Cycle</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub: any) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{sub.profiles?.full_name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{sub.profiles?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{sub.subscription_plans?.name}</TableCell>
                    <TableCell className="capitalize">{sub.subscription_plans?.billing_cycle}</TableCell>
                    <TableCell>{sub.subscription_plans?.price}</TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(sub.assigned_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {sub.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCancellingId(sub.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!cancellingId} onOpenChange={() => setCancellingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this subscription? This action cannot be undone.
              The admin will lose access to their subscription features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelMutation.mutate(cancellingId!)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, cancel subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
