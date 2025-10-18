import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Snowflake, Calendar, DollarSign, FileText } from 'lucide-react';

const freezeSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  durationDays: z.number().min(1, 'Duration must be at least 1 day').max(365, 'Maximum freeze period is 365 days'),
  chargesFee: z.boolean().default(false),
  feeAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type FreezeFormData = z.infer<typeof freezeSchema>;

interface MembershipFreezeDrawerProps {
  open: boolean;
  onClose: () => void;
  member: {
    id: string;
    fullName: string;
    membershipId?: string;
  };
  onFreezeProcessed: () => void;
}

export const MembershipFreezeDrawer = ({
  open,
  onClose,
  member,
  onFreezeProcessed
}: MembershipFreezeDrawerProps) => {
  const { toast } = useToast();
  const { authState } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<FreezeFormData>({
    resolver: zodResolver(freezeSchema),
    defaultValues: {
      reason: '',
      durationDays: 30,
      chargesFee: false,
      feeAmount: 0,
      notes: '',
    },
  });

  const watchChargesFee = form.watch('chargesFee');

  const processFreezeRequest = useMutation({
    mutationFn: async (data: FreezeFormData) => {
      if (!member.membershipId) {
        throw new Error('No active membership found');
      }

      const freezeStartDate = new Date();
      const freezeEndDate = new Date();
      freezeEndDate.setDate(freezeStartDate.getDate() + data.durationDays);

      // 1. Create freeze request
      const { data: freezeRequest, error: freezeError } = await supabase
        .from('membership_freeze_requests')
        .insert({
          membership_id: member.membershipId,
          user_id: authState.user?.id, // Changed from requested_by to user_id
          reason: data.reason,
          freeze_start_date: freezeStartDate.toISOString(),
          freeze_end_date: freezeEndDate.toISOString(),
          requested_days: data.durationDays, // Changed from duration_days to requested_days
          freeze_fee: data.chargesFee ? (data.feeAmount || 0) : 0, // Changed from charge_fee/fee_amount
          notes: data.notes,
          status: 'approved', // Auto-approve for now
          approved_at: new Date().toISOString(),
          approved_by: authState.user?.id
        } as const)
        .select()
        .single();

      if (freezeError) throw freezeError;

      // 2. Update membership status
      const { error: membershipError } = await supabase
        .from('member_memberships')
        .update({ 
          status: 'frozen',
          updated_at: new Date().toISOString()
        })
        .eq('id', member.membershipId);

      if (membershipError) throw membershipError;

      let invoiceId = null;

      // 3. Create invoice for freeze fee if applicable
      if (data.chargesFee && data.feeAmount && data.feeAmount > 0) {
        const invoiceNumber = `FREEZE-${Date.now()}`;
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            invoice_number: invoiceNumber,
            customer_id: member.id,
            customer_name: member.fullName,
            date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            subtotal: data.feeAmount,
            tax: 0,
            discount: 0,
            total: data.feeAmount,
            status: 'draft' as 'draft',
            notes: `Membership freeze fee - ${data.reason}`,
            created_by: authState.user?.id
          })
          .select()
          .single();

        if (invoiceError) throw invoiceError;
        invoiceId = invoice.id;

        // Update freeze request with invoice reference in notes
        await supabase
          .from('membership_freeze_requests')
          .update({ 
            notes: `${data.notes ? data.notes + '\n' : ''}Invoice: ${invoiceNumber}`,
            admin_notes: `Invoice generated: ${invoiceNumber}`
          })
          .eq('id', freezeRequest.id);
      }

      return { freezeRequest, invoiceId };
    },
    onSuccess: (result) => {
      toast({
        title: 'Membership Frozen',
        description: `${member.fullName}'s membership has been frozen successfully${result.invoiceId ? ' and invoice generated' : ''}.`,
      });
      onFreezeProcessed();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process freeze request',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (data: FreezeFormData) => {
    setIsProcessing(true);
    processFreezeRequest.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-blue-500" />
            Freeze Membership
          </SheetTitle>
          <SheetDescription>
            Process membership freeze request for {member.fullName}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Member Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Member Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{member.fullName}</span>
                <span className="text-muted-foreground">ID: {member.id}</span>
              </div>
            </CardContent>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Freeze Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Freeze Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Freeze Reason</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Enter reason for membership freeze (e.g., medical, travel, financial)"
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="durationDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Freeze Duration (Days)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            min="1"
                            max="365"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Any additional notes or special instructions"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Fee Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Fee Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure whether to charge a freeze fee
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="chargesFee"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Charge Freeze Fee</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Apply a processing fee for the freeze request
                          </p>
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

                  {watchChargesFee && (
                    <FormField
                      control={form.control}
                      name="feeAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fee Amount</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Freeze Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{form.watch('durationDays')} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Freeze Fee:</span>
                      <span className="font-medium">
                        {watchChargesFee ? formatCurrency(form.watch('feeAmount') || 0) : 'No fee'}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total Amount:</span>
                      <span>{watchChargesFee ? formatCurrency(form.watch('feeAmount') || 0) : formatCurrency(0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isProcessing || processFreezeRequest.isPending}
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : 'Process Freeze'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};