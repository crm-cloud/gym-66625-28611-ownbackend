import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Banknote, Smartphone, Building2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { PaymentFormData, PaymentMethod, Invoice } from '@/types/membership';
import { useToast } from '@/hooks/use-toast';

const paymentFormSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'bank-transfer']),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

interface PaymentRecorderDrawerProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice;
  onPaymentRecorded: () => void;
}

const paymentMethodOptions = [
  { value: 'cash' as PaymentMethod, label: 'Cash', icon: Banknote },
  { value: 'card' as PaymentMethod, label: 'Credit/Debit Card', icon: CreditCard },
  { value: 'upi' as PaymentMethod, label: 'UPI', icon: Smartphone },
  { value: 'bank-transfer' as PaymentMethod, label: 'Bank Transfer', icon: Building2 },
];

export const PaymentRecorderDrawer = ({ 
  open, 
  onClose, 
  invoice, 
  onPaymentRecorded 
}: PaymentRecorderDrawerProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch payments for this member from transactions table
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        // First, get the member ID from the invoice
        const { data: memberData, error: memberError } = await supabase
          .from('members')
          .select('id')
          .eq('id', invoice.memberId)
          .single();
          
        if (memberError) throw memberError;
        
        if (!memberData) {
          throw new Error('Member not found');
        }
        
        // Then get all payment transactions for this member
        const { data: transactions, error: txError } = await supabase
          .from('transactions')
          .select('amount, description, date')
          .eq('member_id', memberData.id)
          .eq('type', 'income')
          .order('date', { ascending: false });
          
        if (txError) throw txError;
        
        // Sum up all payment amounts
        const totalPaid = transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
        setPaidAmount(totalPaid);
        
      } catch (error) {
        console.error('Error fetching payment transactions:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch payment history',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchPayments();
    }
  }, [open, invoice.id, toast]);

  // Calculate remaining amount after any previous payments
  const remainingAmount = invoice.finalAmount - paidAmount;

  const form = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: remainingAmount > 0 ? remainingAmount : 0,
      paymentMethod: 'cash',
    }
  });

  const watchedPaymentMethod = form.watch('paymentMethod');
  const watchedAmount = form.watch('amount');

  const handleSubmit = async (formData: z.infer<typeof paymentFormSchema>) => {
    setIsProcessing(true);
    
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Validate required IDs
      if (!invoice.memberId || !invoice.branchId) {
        throw new Error('Member ID or Branch ID is missing. Cannot process payment.');
      }
      
      // 2. Create finance transaction
      const transactionData = {
        id: uuidv4(),
        type: 'income',
        amount: formData.amount,
        description: `Payment for Invoice #${invoice.invoiceNumber}${formData.notes ? ' - ' + formData.notes : ''}`,
        reference: formData.referenceNumber || null,
        member_id: invoice.memberId,
        branch_id: invoice.branchId,
        status: 'completed',
        date: today,
      };
      
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          type: 'income',
          amount: formData.amount,
          description: `Membership payment - ${invoice.planName}`,
          reference: formData.referenceNumber || `REF-${Date.now()}`,
          member_id: invoice.memberId,
          branch_id: invoice.branchId,
          status: 'completed',
          date: today
        });

      if (transactionError) throw transactionError;

      // 3. Update invoice status if fully paid
      if (formData.amount >= invoice.finalAmount) {
        const { error: invoiceError } = await supabase
          .from('invoices')
          .update({ 
            status: 'paid'
          })
          .eq('id', invoice.id);

        if (invoiceError) throw invoiceError;
      }

      toast({
        title: 'Payment Recorded',
        description: `Payment of ${formatCurrency(formData.amount)} has been successfully recorded.`,
      });

      onPaymentRecorded();
      onClose();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: 'Error',
        description: (error as any)?.message || (error as any)?.error_description || 'Failed to record payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Loading Payment Information</SheetTitle>
            <SheetDescription>
              Please wait while we load the payment details...
            </SheetDescription>
          </SheetHeader>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const needsReference = watchedPaymentMethod === 'card' || 
                        watchedPaymentMethod === 'upi' || 
                        watchedPaymentMethod === 'bank-transfer';

  const isPartialPayment = watchedAmount < remainingAmount;
  const isOverPayment = watchedAmount > remainingAmount;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Record Payment</SheetTitle>
          <SheetDescription>
            Record payment for invoice {invoice.invoiceNumber}
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-4">

        {/* Invoice Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Member:</span>
              <span className="font-medium">{invoice.memberName}</span>
            </div>
            <div className="flex justify-between">
              <span>Plan:</span>
              <span>{invoice.planName}</span>
            </div>
            <div className="flex justify-between">
              <span>Due Date:</span>
              <span>{format(invoice.dueDate, 'MMM dd, yyyy')}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span>{formatCurrency(invoice.finalAmount)}</span>
            </div>
            {paidAmount > 0 && (
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="text-green-600">-{formatCurrency(paidAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>Amount Due:</span>
              <span className={remainingAmount > 0 ? 'text-amber-600' : 'text-green-600'}>
                {formatCurrency(remainingAmount > 0 ? remainingAmount : 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
            {/* Payment Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Amount *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      step="0.01"
                      min="0.01"
                      max={remainingAmount > 0 ? remainingAmount : 0} // Prevent overpayment
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                  
                  {/* Payment Amount Alerts */}
                  {isPartialPayment && (
                    <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded-md">
                      ⚠️ Partial payment: {formatCurrency(remainingAmount - watchedAmount)} remaining
                    </div>
                  )}
                </FormItem>
              )}
            />
            {/* Quick Amount Buttons */}
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.setValue('amount', invoice.finalAmount)}
              >
                Full Amount
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.setValue('amount', invoice.finalAmount / 2)}
              >
                Half Amount
              </Button>
            </div>

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethodOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center">
                              <IconComponent className="h-4 w-4 mr-2" />
                              {option.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reference Number */}
            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reference Number {needsReference ? '*' : '(Optional)'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter transaction reference"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {needsReference && (
                    <div className="text-sm text-muted-foreground">
                      Reference number is required for {paymentMethodOptions.find(o => o.value === watchedPaymentMethod)?.label}
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? 'Recording...' : 'Record Payment'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};