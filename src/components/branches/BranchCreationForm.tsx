import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Building2, MapPin, Phone, Users } from 'lucide-react';
import { useGymById } from '@/hooks/useGyms';
import { useCreateBranch } from '@/hooks/useBranches';

const branchFormSchema = z.object({
  name: z.string().min(2, 'Branch name must be at least 2 characters'),
  branchCode: z.string().optional(),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(1, 'Pincode is required'),
  phone: z.string().min(1, 'Contact number is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1')
});

type BranchFormData = z.infer<typeof branchFormSchema>;

interface BranchCreationFormProps {
  onSuccess: () => void;
}

export function BranchCreationForm({ onSuccess }: BranchCreationFormProps) {
  const { authState } = useAuth();
  
  // Get gym details and limits
  const { data: gym } = useGymById(authState.user?.gym_id || '');

  const form = useForm<BranchFormData>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: '',
      branchCode: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      capacity: 10
    },
    mode: 'onChange'
  });

  // Watch for changes to generate branch code
  const name = form.watch('name');
  React.useEffect(() => {
    if (name && !form.formState.dirtyFields.branchCode) {
      const code = name
        .substring(0, 4)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      form.setValue('branchCode', code, { shouldValidate: true });
    }
  }, [name, form]);

  const createBranchMutation = useCreateBranch();

  const onSubmit = async (data: BranchFormData) => {
    if (!authState.user?.gym_id) {
      toast({
        title: 'Error',
        description: 'No gym association found',
        variant: 'destructive'
      });
      return;
    }

    // Validate subscription limits
    if (gym && data.capacity > (gym.max_members || 100)) {
      toast({
        title: 'Error',
        description: `Branch capacity cannot exceed your subscription limit of ${gym.max_members || 100} members.`,
        variant: 'destructive'
      });
      return;
    }

    // Generate branch email
    const domain = authState.user.email?.split('@')[1] || 'gym.com';
    const branchEmail = `${data.branchCode?.toLowerCase() || data.name.toLowerCase().replace(/\s+/g, '.')}@${domain}`;
    
    const branchData = {
      name: data.name.trim(),
      address: `${data.street.trim()}, ${data.city.trim()}, ${data.state.trim()} ${data.pincode.trim()}`,
      city: data.city.trim(),
      state: data.state.trim(),
      country: 'US',
      postal_code: data.pincode.trim(),
      phone: data.phone.trim(),
      email: branchEmail,
      max_capacity: Number(data.capacity) || 10,
      current_occupancy: 0,
      gym_id: authState.user.gym_id,
      is_active: true,
      operating_hours: {
        monday: { open: '06:00', close: '22:00' },
        tuesday: { open: '06:00', close: '22:00' },
        wednesday: { open: '06:00', close: '22:00' },
        thursday: { open: '06:00', close: '22:00' },
        friday: { open: '06:00', close: '22:00' },
        saturday: { open: '08:00', close: '20:00' },
        sunday: { open: '08:00', close: '18:00' }
      },
      timezone: 'America/New_York',
      manager_id: null,
      created_at: null,
      updated_at: null
    };

    try {
      await createBranchMutation.mutateAsync(branchData);
      form.reset();
      onSuccess();
    } catch (error: any) {
      // Error is handled by the mutation
      console.error('Branch creation error:', error);
    }
  };

  const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Branch Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Building2 className="h-5 w-5" />
            <h3>Branch Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Downtown Location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="branchCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch Code</FormLabel>
                  <FormControl>
                    <Input placeholder="AUTO" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Member Capacity *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      className="pl-9"
                      placeholder="100"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        {/* Location Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-lg font-semibold">
            <MapPin className="h-5 w-5" />
            <h3>Location Details</h3>
          </div>

          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address *</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main Street" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City *</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP Code *</FormLabel>
                  <FormControl>
                    <Input placeholder="12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Phone className="h-5 w-5" />
            <h3>Contact Information</h3>
          </div>

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="+1 (555) 123-4567"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={createBranchMutation.isPending}
          >
            Reset
          </Button>
          <Button type="submit" disabled={createBranchMutation.isPending}>
            {createBranchMutation.isPending ? 'Creating...' : 'Create Branch'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
