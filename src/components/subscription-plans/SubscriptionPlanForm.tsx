import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

const planFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  price: z.number().min(0, 'Price must be positive'),
  billing_cycle: z.enum(['monthly', 'yearly']),
  max_branches: z.number().min(1, 'Must allow at least 1 branch'),
  max_trainers: z.number().min(1, 'Must allow at least 1 trainer'),
  max_members: z.number().min(1, 'Must allow at least 1 member'),
  features: z.array(z.object({ value: z.string().min(1, 'Feature cannot be empty') })),
  is_active: z.boolean()
});

type PlanFormData = z.infer<typeof planFormSchema>;

interface SubscriptionPlanFormProps {
  plan?: any;
  onSuccess: () => void;
}

export function SubscriptionPlanForm({ plan, onSuccess }: SubscriptionPlanFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: plan?.name || '',
      price: plan?.price || 0,
      billing_cycle: plan?.billing_cycle || 'monthly',
      max_branches: plan?.max_branches || 1,
      max_trainers: plan?.max_trainers || 5,
      max_members: plan?.max_members || 100,
      features: plan?.features?.map((f: string) => ({ value: f })) || [{ value: '' }],
      is_active: plan?.is_active ?? true
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features"
  });

  const createPlan = useMutation({
    mutationFn: async (data: PlanFormData) => {
      const features = data.features.map(f => f.value).filter(f => f.trim() !== '');
      
      if (plan) {
        const { error } = await supabase
          .from('subscription_plans')
          .update({
            name: data.name,
            price: data.price,
            billing_cycle: data.billing_cycle,
            max_branches: data.max_branches,
            max_trainers: data.max_trainers,
            max_members: data.max_members,
            features: features,
            is_active: data.is_active
          })
          .eq('id', plan.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subscription_plans')
          .insert([{
            name: data.name,
            price: data.price,
            billing_cycle: data.billing_cycle,
            max_branches: data.max_branches,
            max_trainers: data.max_trainers,
            max_members: data.max_members,
            features: features,
            is_active: true
          }]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: plan ? "Plan updated successfully" : "Plan created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: PlanFormData) => {
    createPlan.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan Name</FormLabel>
              <FormControl>
                <Input placeholder="Basic, Professional, Enterprise..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="billing_cycle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Cycle</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing cycle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Features</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ value: '' })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Feature
            </Button>
          </div>
          
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <FormField
                control={form.control}
                name={`features.${index}.value`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Feature description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {plan && (
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Plan</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Allow new subscriptions to this plan
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={createPlan.isPending}>
            {createPlan.isPending ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}