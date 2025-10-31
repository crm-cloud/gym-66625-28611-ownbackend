import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';

const gymSetupSchema = z.object({
  name: z.string().min(2, 'Gym name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  postal_code: z.string().optional(),
  subscription_plan: z.enum(['basic', 'standard', 'premium', 'enterprise']),
});

type GymSetupForm = z.infer<typeof gymSetupSchema>;

export default function SetupGym() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<GymSetupForm>({
    resolver: zodResolver(gymSetupSchema),
    defaultValues: {
      subscription_plan: 'standard',
    },
  });

  const onSubmit = async (data: GymSetupForm) => {
    setIsLoading(true);
    try {
      const response = await api.post('/gyms', data);
      
      toast({
        title: 'Gym created successfully!',
        description: 'Your gym has been set up. Redirecting to dashboard...',
      });

      // Wait a moment for the backend to update user_roles, then redirect
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (error: any) {
      console.error('Gym creation error:', error);
      toast({
        title: 'Failed to create gym',
        description: error.response?.data?.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to FitVerse! 🎉</CardTitle>
          <CardDescription className="text-base">
            Let's set up your gym. This is a one-time setup to get you started.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">Gym Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Fitness Hub"
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="info@yourgym.com"
                    {...register('email')}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    placeholder="+1234567890"
                    {...register('phone')}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Location</h3>
              
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  placeholder="123 Gym Street"
                  {...register('address')}
                  className={errors.address ? 'border-destructive' : ''}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="New York"
                    {...register('city')}
                    className={errors.city ? 'border-destructive' : ''}
                  />
                  {errors.city && (
                    <p className="text-sm text-destructive">{errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    placeholder="NY"
                    {...register('state')}
                    className={errors.state ? 'border-destructive' : ''}
                  />
                  {errors.state && (
                    <p className="text-sm text-destructive">{errors.state.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    placeholder="10001"
                    {...register('postal_code')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  placeholder="USA"
                  {...register('country')}
                  className={errors.country ? 'border-destructive' : ''}
                />
                {errors.country && (
                  <p className="text-sm text-destructive">{errors.country.message}</p>
                )}
              </div>
            </div>

            {/* Subscription Plan */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Subscription Plan</h3>
              
              <div className="space-y-2">
                <Label htmlFor="subscription_plan">Select Plan *</Label>
                <Select
                  value={watch('subscription_plan')}
                  onValueChange={(value) => setValue('subscription_plan', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic - $29/month</SelectItem>
                    <SelectItem value="standard">Standard - $79/month</SelectItem>
                    <SelectItem value="premium">Premium - $149/month</SelectItem>
                    <SelectItem value="enterprise">Enterprise - Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating your gym...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
