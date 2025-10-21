import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useCreateGym, useUpdateGym } from '@/hooks/useGyms';
import { useApiQuery } from '@/hooks/useApiQuery';

const gymFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  billing_email: z.string().email('Please enter a valid email'),
  subscription_plan: z.string().min(1, 'Please select a subscription plan'),
  max_branches: z.number().min(1, 'Must allow at least 1 branch'),
  max_trainers: z.number().min(1, 'Must allow at least 1 trainer'),
  max_members: z.number().min(1, 'Must allow at least 1 member'),
  status: z.string().optional()
});

type GymFormData = z.infer<typeof gymFormSchema>;

interface GymFormProps {
  gym?: any;
  onSuccess: () => void;
}

export function GymForm({ gym, onSuccess }: GymFormProps) {
  
  const { data: subscriptionPlans } = useApiQuery(
    ['subscription-plans'],
    '/api/subscription-plans'
  );

  const form = useForm<GymFormData>({
    resolver: zodResolver(gymFormSchema),
    defaultValues: {
      name: gym?.name || '',
      billing_email: gym?.billing_email || '',
      subscription_plan: gym?.subscription_plan || 'basic',
      max_branches: gym?.max_branches || 1,
      max_trainers: gym?.max_trainers || 5,
      max_members: gym?.max_members || 100,
      status: gym?.status || 'active'
    }
  });

  const createGymMutation = useCreateGym();
  const updateGymMutation = useUpdateGym(gym?.id || '');

  const onSubmit = async (data: GymFormData) => {
    try {
      if (gym) {
        await updateGymMutation.mutateAsync(data);
      } else {
        await createGymMutation.mutateAsync(data);
      }
      toast({
        title: "Success",
        description: gym ? "Gym updated successfully" : "Gym created successfully"
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gym Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter gym name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="billing_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="billing@gym.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subscription_plan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subscription Plan</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subscriptionPlans?.map((plan) => (
                    <SelectItem key={plan.id} value={plan.name.toLowerCase()}>
                      {plan.name} - ${plan.price}/{plan.billing_cycle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="max_branches"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Branches</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_trainers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Trainers</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_members"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Members</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {gym && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={createGymMutation.isPending || updateGymMutation.isPending}>
            {(createGymMutation.isPending || updateGymMutation.isPending) ? 'Saving...' : gym ? 'Update Gym' : 'Create Gym'}
          </Button>
        </div>
      </form>
    </Form>
  );
}