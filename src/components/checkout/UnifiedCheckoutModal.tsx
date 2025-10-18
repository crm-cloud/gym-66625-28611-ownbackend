import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { usePaymentGateway } from '@/hooks/usePaymentGateway';
import { useCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Loader2, Tag, Gift } from 'lucide-react';

interface CheckoutItem {
  type: 'membership' | 'training' | 'product' | 'invoice';
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface UnifiedCheckoutModalProps {
  open: boolean;
  onClose: () => void;
  items: CheckoutItem[];
  onSuccess?: () => void;
}

export const UnifiedCheckoutModal = ({ open, onClose, items, onSuccess }: UnifiedCheckoutModalProps) => {
  const { formatCurrency } = useCurrency();
  const { authState } = useAuth();
  const { createPaymentOrder, openPaymentGateway, isProcessing } = usePaymentGateway();
  
  const [discountCode, setDiscountCode] = useState('');
  const [useRewards, setUseRewards] = useState(false);
  const [rewardsAmount, setRewardsAmount] = useState(0);
  const [availableRewards, setAvailableRewards] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountValidating, setDiscountValidating] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const finalTotal = Math.max(0, subtotal - discountAmount - rewardsAmount);

  // Fetch available rewards balance
  useEffect(() => {
    const fetchRewards = async () => {
      if (!authState.user?.id) return;
      
      const { data } = await supabase
        .from('member_credits')
        .select('balance')
        .eq('user_id', authState.user.id)
        .maybeSingle();
      
      if (data) {
        setAvailableRewards(data.balance);
      }
    };
    
    if (open) {
      fetchRewards();
      setDiscountCode('');
      setDiscountAmount(0);
      setDiscountApplied(false);
      setUseRewards(false);
      setRewardsAmount(0);
    }
  }, [open, authState.user?.id]);

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) return;
    
    setDiscountValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-discount-code', {
        body: {
          code: discountCode,
          userId: authState.user?.id,
          purchaseType: items[0]?.type || 'membership',
          amount: subtotal,
        },
      });

      if (error || !data?.valid) {
        toast({ 
          title: 'Invalid Code', 
          description: data?.error || 'Discount code is invalid', 
          variant: 'destructive' 
        });
        setDiscountAmount(0);
        setDiscountApplied(false);
      } else {
        setDiscountAmount(data.discountAmount);
        setDiscountApplied(true);
        toast({ 
          title: 'Code Applied', 
          description: `Discount of ${formatCurrency(data.discountAmount)} applied!` 
        });
      }
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setDiscountValidating(false);
    }
  };

  const handleProceedToPayment = async () => {
    try {
      const response = await createPaymentOrder({
        provider: 'razorpay',
        amount: finalTotal,
        currency: 'INR',
        invoiceId: items[0]?.type === 'invoice' ? items[0].id : undefined,
        membershipId: items[0]?.type === 'membership' ? items[0].id : undefined,
        discountCode: discountApplied ? discountCode : undefined,
        rewardsUsed: useRewards ? rewardsAmount : 0,
      });

      if (response) {
        await openPaymentGateway(response, finalTotal);
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-semibold">Order Summary</h3>
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <span className="font-medium ml-4">{formatCurrency(item.price)}</span>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between text-lg">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Discount Code */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <Label>Apply Discount Code</Label>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter discount code"
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value.toUpperCase());
                    setDiscountApplied(false);
                    setDiscountAmount(0);
                  }}
                  disabled={discountApplied}
                />
                <Button
                  variant="outline"
                  onClick={validateDiscountCode}
                  disabled={discountValidating || !discountCode.trim() || discountApplied}
                >
                  {discountValidating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {discountApplied ? 'Applied' : 'Apply'}
                </Button>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount Applied:</span>
                  <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rewards Balance */}
          {availableRewards > 0 && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={useRewards}
                      onCheckedChange={(checked) => {
                        setUseRewards(checked as boolean);
                        if (checked) {
                          const maxRedeemable = Math.min(availableRewards, subtotal - discountAmount);
                          setRewardsAmount(maxRedeemable);
                        } else {
                          setRewardsAmount(0);
                        }
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-muted-foreground" />
                      <Label>Use Rewards Balance</Label>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    Available: {formatCurrency(availableRewards)}
                  </Badge>
                </div>
                
                {useRewards && (
                  <div className="space-y-2">
                    <Label>Amount to Use</Label>
                    <Input
                      type="number"
                      value={rewardsAmount}
                      max={Math.min(availableRewards, subtotal - discountAmount)}
                      min={0}
                      step={0.01}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        const maxRedeemable = Math.min(availableRewards, subtotal - discountAmount);
                        setRewardsAmount(Math.min(value, maxRedeemable));
                      }}
                    />
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Rewards Applied:</span>
                      <span className="font-semibold">-{formatCurrency(rewardsAmount)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Final Total */}
          <Card className="border-primary">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center text-2xl font-bold">
                <span>Total Amount:</span>
                <span className="text-primary">{formatCurrency(finalTotal)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleProceedToPayment}
            disabled={isProcessing || finalTotal < 0}
          >
            {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isProcessing ? 'Processing...' : 'Proceed to Payment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
