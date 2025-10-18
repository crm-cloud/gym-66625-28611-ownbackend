import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { User, Building2, CreditCard, Settings, MapPin, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

const adminFormSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string()
    .transform(val => val.replace(/\D/g, '')) // Remove all non-digits
    .optional()
    .or(z.literal('')),
  date_of_birth: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(), 
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  subscription_plan: z.string().min(1, 'Please select a subscription plan'),
  create_new_gym: z.boolean().default(true),
  gym_name: z.string().optional(),
  existing_gym_id: z.string().optional(),
  existing_branch_id: z.string().optional(),
}).refine(
  (data) => {
    if (data.create_new_gym) {
      return !!data.gym_name && data.gym_name.length >= 2;
    }
    return !!data.existing_gym_id;
  },
  {
    message: 'Either provide a gym name for new gym or select an existing gym',
    path: ['gym_name'],
  }
);

type AdminFormData = z.infer<typeof adminFormSchema>;

interface AdminAccountFormProps {
  onSuccess: () => void;
}

export function AdminAccountForm({ onSuccess }: AdminAccountFormProps) {
  const queryClient = useQueryClient();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [createNewGym, setCreateNewGym] = useState(true);

  const form = useForm<AdminFormData>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      address: {
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
      },
      subscription_plan: '',
      create_new_gym: true,
      gym_name: '',
      existing_gym_id: '',
      existing_branch_id: '',
    }
  });

  // Get available subscription plans
  const { data: subscriptionPlans } = useQuery({
    queryKey: ['subscription-plans-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch existing gyms for selection
  const { data: existingGyms } = useQuery({
    queryKey: ['gyms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gyms')
        .select('id, name, status')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch branches for selected gym
  const selectedGymId = form.watch('existing_gym_id');
  const { data: gymBranches } = useQuery({
    queryKey: ['gym-branches', selectedGymId],
    queryFn: async () => {
      if (!selectedGymId) return [];
      
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, status')
        .eq('gym_id', selectedGymId)
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedGymId && !createNewGym,
  });

  // Auto-fetch location
  const fetchLocation = async () => {
    setIsLoadingLocation(true);
    try {
      if (!navigator.geolocation) {
        toast({
          title: "Geolocation not supported",
          description: "Please enter address manually",
          variant: "destructive"
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Using a free geocoding service
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=demo&language=en&pretty=1`
            );
            const data = await response.json();
            
            if (data.results && data.results[0]) {
              const result = data.results[0].components;
              form.setValue('address', {
                street: result.road || '',
                city: result.city || result.town || result.village || '',
                state: result.state || '',
                postal_code: result.postcode || '',
                country: result.country || 'India'
              });
              
              toast({
                title: "Location fetched",
                description: "Address has been auto-filled from your location"
              });
            }
          } catch (error) {
            console.error('Geocoding error:', error);
            toast({
              title: "Location fetch failed",
              description: "Please enter address manually",
              variant: "destructive"
            });
          } finally {
            setIsLoadingLocation(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: "Location access denied",
            description: "Please enter address manually",
            variant: "destructive"
          });
          setIsLoadingLocation(false);
        }
      );
    } catch (error) {
      console.error('Location fetch error:', error);
      setIsLoadingLocation(false);
    }
  };

  // Format Indian phone number
  const formatPhoneNumber = (value: string) => {
    // If empty, return empty
    if (!value) return '';
    
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // For India (91), format as +91 XXXX XXXXX
    if (cleaned.startsWith('91') && cleaned.length > 2) {
      const number = cleaned.slice(2);
      if (number.length <= 5) return `+91 ${number}`;
      return `+91 ${number.slice(0, 5)} ${number.slice(5, 10)}`;
    }
    
    // For other countries, just add + if it's a number
    if (cleaned) return `+${cleaned}`;
    
    return value;
  };


  const createAdminAccount = useMutation({
    mutationFn: async (data: AdminFormData) => {
      try {
        // Generate temporary password
        const { generateTempPassword } = await import('@/services/userManagement');
        const tempPassword = generateTempPassword();
        
        // Build request body, only including defined values
        const requestBody: any = {
          email: data.email,
          password: tempPassword,
          full_name: data.full_name,
          phone: data.phone || null,
          subscription_plan: data.subscription_plan || 'basic',
          date_of_birth: data.date_of_birth || null,
          address: data.address || null,
        };

        // Add gym-specific fields based on mode
        if (data.create_new_gym) {
          requestBody.gym_name = data.gym_name || `${data.full_name}'s Gym`;
        } else {
          requestBody.existing_gym_id = data.existing_gym_id;
          requestBody.existing_branch_id = data.existing_branch_id;
        }
        
        // Call edge function with properly formatted body
        const { data: result, error: createError } = await supabase.functions.invoke('create-admin-user', {
          body: requestBody
        });
        
        if (createError) {
          console.error('Edge function error:', createError);
          throw new Error(createError.message || 'Failed to create admin user');
        }
        
        if (!result?.success) {
          console.error('Admin creation failed:', result?.error);
          throw new Error(result?.error || 'Failed to create admin user');
        }
        
        // Send welcome email (non-blocking)
        const gymNameForEmail = data.create_new_gym 
          ? (data.gym_name || `${data.full_name}'s Gym`)
          : 'your assigned gym';
          
        try {
          await supabase.functions.invoke('send-admin-welcome-email', {
            body: {
              adminId: result.user_id,
              adminEmail: data.email,
              adminName: data.full_name,
              gymName: gymNameForEmail,
              temporaryPassword: tempPassword,
            }
          });
        } catch (emailError) {
          console.warn('Welcome email failed (non-critical):', emailError);
        }
        
        return {
          success: true,
          user_id: result.user_id,
          gym_id: result.gym_id,
          tempPassword: tempPassword,
          message: 'Admin account created successfully'
        };
        
      } catch (error: any) {
        console.error('Admin creation error:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      toast({
        title: "Admin Account Created",
        description: "Admin account created successfully. They can now login with their email and will need to reset their password on first login.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['gyms-active'] });
      form.reset();
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Admin creation error:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      // Handle specific error cases
      if (error?.message?.includes('email_exists') || error?.message?.includes('already registered')) {
        errorMessage = 'User already exists. If their profile wasn\'t found, ask them to login once, then retry.';
      } else if (error?.message?.includes('foreign key constraint')) {
        errorMessage = 'There was a database timing issue. Please try again in a few seconds.';
      } else if (error?.message?.includes('subscription plan')) {
        errorMessage = 'Invalid subscription plan selected. Please choose a valid plan.';
      }

      toast({
        title: "Failed to Create Admin",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: AdminFormData) => {
    createAdminAccount.mutate(data);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column - Admin Details */}
            <div className="space-y-6">
              {/* Admin Details Section */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Admin Details</CardTitle>
                  </div>
                  <CardDescription>
                    Basic information about the new admin user
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter admin's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="admin@gym.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                                +91
                              </div>
                              <Input 
                                placeholder="Enter 10-digit mobile number"
                                className="pl-10"
                                {...field}
                                value={field.value?.replace(/^\+91\s*/, '') || ''}
                                onChange={(e) => {
                                  const digits = e.target.value.replace(/\D/g, '');
                                  // Only allow 10 digits for Indian numbers
                                  const formatted = digits.length <= 10 ? digits : e.target.value;
                                  field.onChange(formatted ? `+91 ${formatted}` : '');
                                }}
                                maxLength={12} // 10 digits + 2 spaces
                              />
                            </div>
                          </FormControl>
                          <CardDescription>
                            Enter 10-digit Indian mobile number
                          </CardDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date_of_birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address & Location Section */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">Address & Location</CardTitle>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={fetchLocation}
                      disabled={isLoadingLocation}
                    >
                      {isLoadingLocation ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <MapPin className="w-4 h-4 mr-2" />
                      )}
                      Auto-fetch
                    </Button>
                  </div>
                  <CardDescription>
                    Location details for the admin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter street address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter state" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address.postal_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter PIN code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Subscription & Gym */}
            <div className="space-y-6">
              {/* Subscription Plan Section */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Subscription Plan</CardTitle>
                  </div>
                  <CardDescription>
                    Choose the subscription plan for this admin's gym
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="subscription_plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subscription plan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subscriptionPlans?.map((plan) => (
                              <SelectItem key={plan.id} value={plan.name}>
                                <div className="flex flex-col items-start">
                                  <div className="font-medium">
                                    {plan.name} - ₹{plan.price}/{plan.billing_cycle}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {plan.max_branches} branches • {plan.max_trainers} trainers • {plan.max_members} members
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Gym Selection Section */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Gym Assignment</CardTitle>
                  </div>
                  <CardDescription>
                    Choose to create a new gym or assign to an existing one
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={createNewGym ? "default" : "outline"}
                      onClick={() => {
                        setCreateNewGym(true);
                        form.setValue('create_new_gym', true);
                        form.setValue('existing_gym_id', '');
                        form.setValue('existing_branch_id', '');
                      }}
                      className="flex-1"
                    >
                      Create New Gym
                    </Button>
                    <Button
                      type="button"
                      variant={!createNewGym ? "default" : "outline"}
                      onClick={() => {
                        setCreateNewGym(false);
                        form.setValue('create_new_gym', false);
                        form.setValue('gym_name', '');
                      }}
                      className="flex-1"
                    >
                      Assign to Existing Gym
                    </Button>
                  </div>

                  {createNewGym ? (
                    <FormField
                      control={form.control}
                      name="gym_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gym Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter gym name" {...field} />
                          </FormControl>
                          <CardDescription>
                            This will be the name of the new gym managed by this admin
                          </CardDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <>
                      <FormField
                        control={form.control}
                        name="existing_gym_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Gym *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a gym" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {existingGyms?.map((gym) => (
                                  <SelectItem key={gym.id} value={gym.id}>
                                    {gym.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {selectedGymId && gymBranches && gymBranches.length > 0 && (
                        <FormField
                          control={form.control}
                          name="existing_branch_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select Branch (Optional)</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a branch or leave empty for default" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {gymBranches.map((branch) => (
                                    <SelectItem key={branch.id} value={branch.id}>
                                      {branch.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <CardDescription>
                                If not selected, admin will be assigned to the first active branch
                              </CardDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => form.reset()}
              disabled={createAdminAccount.isPending}
            >
              Reset Form
            </Button>
            <Button 
              type="submit" 
              disabled={createAdminAccount.isPending}
              className="min-w-[140px]"
            >
              {createAdminAccount.isPending ? (
                <>
                  <Settings className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Admin Account'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}