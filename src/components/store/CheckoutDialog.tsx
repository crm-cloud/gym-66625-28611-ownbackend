import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Banknote, Smartphone, CheckCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PaymentMethod, Order } from '@/types/product';
import { InvoiceGenerator } from '@/components/pos/InvoiceGenerator';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CheckoutDialog = ({ open, onOpenChange }: CheckoutDialogProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<Order | null>(null);
  const [billingInfo, setBillingInfo] = useState({
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: ''
  });

  const { items, getTotalPrice, clearCart } = useCart();
  const { authState } = useAuth();
  const { toast } = useToast();

  const taxRate = 0.08;
  const subtotal = getTotalPrice();
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newOrder: Order = {
      id: `store-${Date.now()}`,
      orderNumber: `STO-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      items: [...items],
      subtotal,
      tax,
      total,
      customerId: authState.user?.id,
      customerName: authState.user?.name || billingInfo.email,
      customerEmail: authState.user?.email || billingInfo.email,
      paymentMethod,
      paymentStatus: 'paid',
      orderStatus: 'completed',
      createdAt: new Date().toISOString(),
      createdBy: authState.user?.id || 'member',
      notes: 'Online store purchase'
    };

    setOrderComplete(newOrder);
    clearCart();
    setIsProcessing(false);
    
    toast({
      title: "Order Complete!",
      description: `Your order ${newOrder.orderNumber} has been placed successfully.`,
    });
  };

  const resetDialog = () => {
    setOrderComplete(null);
    setBillingInfo({
      email: '',
      phone: '',
      address: '',
      city: '',
      zipCode: ''
    });
    onOpenChange(false);
  };

  if (orderComplete) {
    return (
      <Dialog open={open} onOpenChange={resetDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Order Complete!
            </DialogTitle>
            <DialogDescription>
              Your order has been placed successfully. Here's your invoice:
            </DialogDescription>
          </DialogHeader>
          
          <InvoiceGenerator order={orderComplete} />
          
          <DialogFooter>
            <Button variant="outline" onClick={resetDialog}>
              Continue Shopping
            </Button>
            <Button onClick={() => window.print()}>
              Print Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>
            Complete your purchase below
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.product.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        ${item.product.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (8%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment & Billing */}
          <div className="space-y-4">
            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Billing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={authState.user?.email || billingInfo.email}
                      onChange={(e) => setBillingInfo(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!!authState.user?.email}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={billingInfo.phone}
                      onChange={(e) => setBillingInfo(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={billingInfo.address}
                    onChange={(e) => setBillingInfo(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={billingInfo.city}
                      onChange={(e) => setBillingInfo(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={billingInfo.zipCode}
                      onChange={(e) => setBillingInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="card" className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Card
                    </TabsTrigger>
                    <TabsTrigger value="digital_wallet" className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Digital
                    </TabsTrigger>
                    <TabsTrigger value="member_credit" className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Credit</Badge>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="card" className="space-y-4 mt-4">
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-2">
                        This is a demo checkout. In a real application, you would integrate with a payment processor like Stripe.
                      </p>
                      <Badge variant="secondary">Demo Mode</Badge>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="digital_wallet" className="space-y-4 mt-4">
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-2">
                        Digital wallet payment would be integrated here (Apple Pay, Google Pay, etc.)
                      </p>
                      <Badge variant="secondary">Demo Mode</Badge>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="member_credit" className="space-y-4 mt-4">
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-2">
                        Use member account credit for this purchase
                      </p>
                      <Badge variant="secondary">Available Credit: $50.00</Badge>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={isProcessing || items.length === 0}
            className="min-w-[150px]"
          >
            {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};