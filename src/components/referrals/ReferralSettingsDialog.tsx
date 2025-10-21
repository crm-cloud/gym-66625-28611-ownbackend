import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRBAC } from '@/hooks/useRBAC';
import { Settings, DollarSign, Users, Gift } from 'lucide-react';
import { useSystemSettings, useUpdateSystemSetting } from '@/hooks/useSystemSettings';

const settingsSchema = z.object({
  referral_enabled: z.boolean(),
  referral_signup_bonus: z.number().min(0, 'Must be a positive number'),
  referral_membership_bonus: z.number().min(0, 'Must be a positive number'),
  referral_min_redeem_amount: z.number().min(0, 'Must be a positive number'),
  referral_max_bonus_per_month: z.number().min(0, 'Must be a positive number'),
});

type ReferralSettingsData = z.infer<typeof settingsSchema>;

interface ReferralSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReferralSettingsDialog = ({
  open,
  onOpenChange
}: ReferralSettingsDialogProps) => {
  const { toast } = useToast();
  const { hasPermission } = useRBAC();
  const queryClient = useQueryClient();

  // Check for the correct permission based on your RBAC system
  const canManageSettings = hasPermission('settings.edit');

  // Fetch current settings using REST API
  const { data: settingsData, isLoading } = useSystemSettings('referral');
  const updateSetting = useUpdateSystemSetting();

  const settings = settingsData?.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, any>) || {
    referral_enabled: true,
    referral_signup_bonus: 500,
    referral_membership_bonus: 2500,
    referral_min_redeem_amount: 1000,
    referral_max_bonus_per_month: 50000,
  };

  const form = useForm<ReferralSettingsData>({
    resolver: zodResolver(settingsSchema),
    values: settings,
  });

  const saveSettings = useMutation({
    mutationFn: async (data: ReferralSettingsData) => {
      const settingsToUpdate = Object.entries(data).map(([key, value]) => ({
        key,
        value,
        category: 'referral',
        description: getSettingDescription(key)
      }));

      for (const setting of settingsToUpdate) {
        await updateSetting.mutateAsync(setting);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Settings Updated',
        description: 'Referral settings have been updated successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings',
        variant: 'destructive'
      });
    }
  });

  const getSettingDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      referral_enabled: 'Enable or disable the referral program',
      referral_signup_bonus: 'Bonus amount when referred user signs up',
      referral_membership_bonus: 'Bonus amount when referred user purchases membership',
      referral_min_redeem_amount: 'Minimum amount required to redeem rewards',
      referral_max_bonus_per_month: 'Maximum bonus amount per user per month'
    };
    return descriptions[key] || '';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (!canManageSettings) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Access Denied</DialogTitle>
            <DialogDescription>
              You don't have permission to manage referral settings.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Referral Program Settings
          </DialogTitle>
          <DialogDescription>
            Configure referral program parameters and bonus amounts
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading settings...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => saveSettings.mutate(data))} className="space-y-6">
              {/* General Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    General Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="referral_enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Enable Referral Program</FormLabel>
                          <FormDescription>
                            Turn the referral program on or off system-wide
                          </FormDescription>
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
                </CardContent>
              </Card>

              {/* Bonus Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Bonus Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="referral_signup_bonus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Signup Bonus</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              min="0"
                              step="1"
                            />
                          </FormControl>
                          <FormDescription>
                            Reward for successful signup
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="referral_membership_bonus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Membership Bonus</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              min="0"
                              step="1"
                            />
                          </FormControl>
                          <FormDescription>
                            Reward for membership purchase
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Limits & Restrictions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Limits & Restrictions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="referral_min_redeem_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Redeem Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              min="0"
                              step="1"
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum amount to redeem rewards
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="referral_max_bonus_per_month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Bonus Per Month</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              min="0"
                              step="1"
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum bonus per user per month
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <p><strong>Status:</strong> {form.watch('referral_enabled') ? 'Enabled' : 'Disabled'}</p>
                    <p><strong>Signup Reward:</strong> {formatCurrency(form.watch('referral_signup_bonus'))}</p>
                    <p><strong>Membership Reward:</strong> {formatCurrency(form.watch('referral_membership_bonus'))}</p>
                    <p><strong>Min. Redeem:</strong> {formatCurrency(form.watch('referral_min_redeem_amount'))}</p>
                    <p><strong>Monthly Limit:</strong> {formatCurrency(form.watch('referral_max_bonus_per_month'))}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveSettings.isPending}>
                  {saveSettings.isPending ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};