import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Building2, MapPin, Phone, Users } from 'lucide-react';

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
  const queryClient = useQueryClient();
  
  // Get gym details and limits
  const { data: gym } = useQuery({
    queryKey: ['gym-details', authState.user?.gym_id],
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

  // Auto-generate branch code when name changes
  const handleNameChange = (value: string) => {
    if (!form.getValues('branchCode')) {
      const code = value
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 4);
      form.setValue('branchCode', code);
    }
  };

  interface ProfileData {
    gym_id: string;
  }

  interface UserProfile {
    id: string;
    gym_id: string | null;
  }

  const createBranch = useMutation({
    mutationFn: async (data: BranchFormData) => {
      console.log('[BranchCreation] Starting branch creation with data:', data);
      
      if (!authState.user) {
        console.error('[BranchCreation] No authenticated user found');
        throw new Error('User not authenticated. Please log in again.');
      }
      
      // Get user ID and log it for debugging
      const userId = authState.user.id;
      console.log(`[BranchCreation] Authenticated user ID: ${userId}`);
      
      // First try to get gym_id from the user object
      let gymId = authState.user.gym_id;
      console.log(`[BranchCreation] Initial gym_id from auth state: ${gymId || 'not found'}`);
      
      // If not found in user object, try to get it from the profiles table
      if (!gymId) {
        console.log('[BranchCreation] Gym ID not found in user object, checking profiles table...');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('gym_id, role')
          .eq('id', userId)
          .single<UserProfile>();
          
        if (profileError) {
          console.error('[BranchCreation] Error fetching profile:', profileError);
          throw new Error('Failed to fetch your profile information. Please try again.');
        }
        
        console.log('[BranchCreation] Profile data:', profile);
        
        if (!profile?.gym_id) {
          console.error('[BranchCreation] No gym_id found in profile');
          throw new Error('Your account is not associated with a gym. Please contact support.');
        }
        
        gymId = profile.gym_id;
        console.log(`[BranchCreation] Found gym_id in profiles table: ${gymId}`);
        
        // Update auth state with gym_id if it was missing
        if (authState.user) {
          authState.user.gym_id = gymId;
        }
      }
      
      if (!gymId) {
        throw new Error('Could not determine gym association. Please contact support.');
      }
      
      console.log(`[BranchCreation] Using gym_id: ${gymId}`);
      
      // Validate subscription limits
      console.log('[BranchCreation] Checking subscription limits...');
      const { data: existingBranches, error: branchError } = await supabase
        .from('branches')
        .select('id, status')
        .eq('gym_id', gymId);

      if (branchError) {
        console.error('[BranchCreation] Error fetching existing branches:', branchError);
        throw new Error('Failed to verify subscription limits. Please try again.');
      }

      const activeBranches = existingBranches.filter(b => b.status === 'active');
      console.log(`[BranchCreation] Found ${activeBranches.length} active branches out of ${existingBranches.length} total`);

      if (activeBranches.length >= (gym?.max_branches || 1)) {
        throw new Error(`Cannot create more branches. Your subscription allows a maximum of ${gym?.max_branches || 1} branches. Please upgrade your subscription to add more branches.`);
      }

      // Validate member capacity against gym limits
      if (data.capacity > (gym?.max_members || 100)) {
        throw new Error(`Branch capacity cannot exceed your subscription limit of ${gym?.max_members || 100} members.`);
      }

      // Generate branch email
      const domain = authState.user.email?.split('@')[1] || 'gym.com';
      const branchEmail = `${data.branchCode?.toLowerCase() || data.name.toLowerCase().replace(/\s+/g, '.')}@${domain}`;
      
      const branchData = {
        name: data.name.trim(),
        code: data.branchCode?.toUpperCase() || data.name.substring(0, 4).toUpperCase(),
        address: {
          street: data.street.trim(),
          city: data.city.trim(),
          state: data.state.trim(),
          zipCode: data.pincode.trim(),
          country: 'US'
        },
        contact: {
          phone: data.phone.trim(),
          email: branchEmail
        },
        capacity: Number(data.capacity) || 10,
        current_members: 0,
        gym_id: gymId,
        status: 'active',
        hours: {
          monday: { open: '06:00', close: '22:00' },
          tuesday: { open: '06:00', close: '22:00' },
          wednesday: { open: '06:00', close: '22:00' },
          thursday: { open: '06:00', close: '22:00' },
          friday: { open: '06:00', close: '22:00' },
          saturday: { open: '08:00', close: '20:00' },
          sunday: { open: '08:00', close: '18:00' }
        },
        amenities: ['Parking', 'Lockers', 'WiFi'],
        images: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('[BranchCreation] Branch data being inserted:', JSON.stringify(branchData, null, 2));
      
      // Start a transaction to ensure data consistency
      const { data: newBranch, error: insertError } = await supabase
        .from('branches')
        .insert([branchData])
        .select('*')
        .single();
      
      if (insertError) {
        console.error('[BranchCreation] Error creating branch:', insertError);
        
        // Handle specific error cases
        if (insertError.code === '42501') {
          throw new Error('Permission denied. You do not have permission to create branches.');
        } else if (insertError.code === '23505') {
          throw new Error('A branch with this name or code already exists. Please choose a different name or code.');
        } else if (insertError.code === '23503') {
          throw new Error('Invalid gym association. Please contact support.');
        } else if (insertError.code === 'PGRST116') {
          // This is a PostgREST error for missing required fields
          throw new Error('Missing required information. Please check all fields and try again.');
        }
        
        // Generic error for other cases
        throw new Error(insertError.message || 'Failed to create branch. Please try again.');
      }

      if (!newBranch) {
        console.error('[BranchCreation] No data returned after branch creation');
        throw new Error('Failed to create branch. No data was returned.');
      }

      console.log('[BranchCreation] Branch created successfully:', newBranch);
      return newBranch;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Branch created successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['admin-branches'] });
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

  const onSubmit = (data: BranchFormData) => {
    createBranch.mutate(data);
  };

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Branch Name *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Downtown Fitness Center" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <FormField
                control={form.control}
                name="branchCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="DFC" {...field} maxLength={6} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Address Information
            </h3>
            
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
                      <Input placeholder="New York" {...field} />
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
                        {states.map((state) => (
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
                    <FormLabel>Pincode *</FormLabel>
                    <FormControl>
                      <Input placeholder="10001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact Number *
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Maximum Members *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="1"
                      max={gym?.max_members || 100}
                      placeholder="100"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                  {gym?.max_members && (
                    <p className="text-xs text-muted-foreground">
                      Maximum allowed by your subscription: {gym.max_members}
                    </p>
                  )}
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="flex gap-4 pt-4"
          >
            <Button 
              type="button" 
              variant="outline" 
              onClick={onSuccess}
              disabled={createBranch.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createBranch.isPending}
              className="min-w-32"
            >
              {createBranch.isPending ? 'Creating...' : 'Create Branch'}
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}