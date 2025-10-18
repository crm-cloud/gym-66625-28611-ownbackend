import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedCheckoutModal } from '@/components/checkout/UnifiedCheckoutModal';
import { Dumbbell, Calendar, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TrainerPackageBookingProps {
  trainerId?: string;
  branchId?: string;
}

export const TrainerPackageBooking = ({ trainerId, branchId }: TrainerPackageBookingProps) => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  const { data: packages, isLoading } = useSupabaseQuery(
    ['trainer-packages', trainerId, branchId],
    async () => {
      let query = supabase
        .from('trainer_package_rates')
        .select('*, profiles(full_name, email)')
        .eq('is_active', true);
      
      if (trainerId) {
        query = query.eq('trainer_id', trainerId);
      }
      if (branchId) {
        query = query.eq('branch_id', branchId);
      }

      const { data, error } = await query.order('price', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  );

  const handleBuyPackage = (pkg: any) => {
    setSelectedPackage([{
      type: 'training',
      id: pkg.id,
      name: `${pkg.package_name} - ${pkg.profiles.full_name}`,
      price: pkg.price,
      description: `${pkg.session_count} sessions • ${pkg.duration_days} days validity`,
    }]);
    setCheckoutOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No training packages available at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">{pkg.package_name}</span>
                <Badge variant="secondary">{pkg.profiles.full_name}</Badge>
              </CardTitle>
              <CardDescription>
                {pkg.description || 'Personal training package'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  <span className="font-medium">{pkg.session_count} Training Sessions</span>
                </div>
                {pkg.duration_days && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium">{pkg.duration_days} Days Validity</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-muted-foreground">Personalized workout plan</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-2xl font-bold text-primary">
                  ₹{pkg.price.toLocaleString('en-IN')}
                </div>
                <Button onClick={() => handleBuyPackage(pkg)}>
                  Buy Package
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPackage && (
        <UnifiedCheckoutModal
          open={checkoutOpen}
          onClose={() => {
            setCheckoutOpen(false);
            setSelectedPackage(null);
          }}
          items={selectedPackage}
          onSuccess={() => {
            setCheckoutOpen(false);
            setSelectedPackage(null);
          }}
        />
      )}
    </>
  );
};
