import { useState, useEffect } from 'react';
import { CreditCard, Receipt, ShoppingBag, UserPlus, DollarSign, AlertCircle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { UnifiedCheckoutModal } from '@/components/checkout/UnifiedCheckoutModal';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const MemberBilling = () => {
  const { data: member, isLoading: memberLoading } = useMemberProfile();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [activeMembership, setActiveMembership] = useState<any>(null);
  const [rewardsBalance, setRewardsBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!member?.user_id) return;
      
      setLoading(true);
      try {
        // Fetch invoices
        const invoiceQuery: any = await supabase
          .from('invoices')
          .select('*')
          .eq('customer_id', member.user_id)
          .order('created_at', { ascending: false });
        
        setInvoices(invoiceQuery.data || []);

        // Fetch payments
        if (invoiceQuery.data && invoiceQuery.data.length > 0) {
          const invoiceIds = invoiceQuery.data.map((inv: any) => inv.id);
          const paymentQuery: any = await supabase
            .from('payments')
            .select('*')
            .in('invoice_id', invoiceIds)
            .order('payment_date', { ascending: false });
          
          setPayments(paymentQuery.data || []);
        }

        // Fetch active membership - simplified
        const membershipQuery: any = await supabase
          .from('member_memberships')
          .select('*')
          .eq('user_id', member.user_id)
          .eq('status', 'active')
          .maybeSingle();
        
        if (membershipQuery.data) {
          // Fetch plan details separately
          const planQuery: any = await supabase
            .from('membership_plans')
            .select('name, price')
            .eq('id', membershipQuery.data.membership_plan_id)
            .single();
          
          setActiveMembership({
            ...membershipQuery.data,
            membership_plans: planQuery.data
          });
        }

        // Fetch rewards balance
        const creditsQuery: any = await supabase
          .from('member_credits')
          .select('balance')
          .eq('user_id', member.user_id)
          .maybeSingle();
        
        setRewardsBalance(creditsQuery.data?.balance || 0);
      } catch (error) {
        console.error('Error fetching billing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [member?.user_id, member?.id]);

  const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid' || inv.status === 'overdue');
  const totalOutstanding = unpaidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const handlePayInvoice = (invoice: any) => {
    setCheckoutItems([{
      type: 'invoice',
      id: invoice.id,
      name: `Invoice #${invoice.invoice_number}`,
      price: invoice.total,
      description: invoice.notes,
    }]);
    setCheckoutOpen(true);
  };

  if (memberLoading || loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-2">Profile Setup Required</h1>
        <p className="text-muted-foreground">
          Your member profile is being set up. Please contact support if this persists.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Billing</h1>
        <p className="text-muted-foreground">Manage your payments and purchase services</p>
      </div>

      {/* Outstanding Payments Alert */}
      {totalOutstanding > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-destructive">Outstanding Balance</h3>
                <p className="text-sm text-muted-foreground">
                  You have {unpaidInvoices.length} unpaid invoice(s) totaling {formatCurrency(totalOutstanding)}
                </p>
              </div>
              <Button variant="destructive" onClick={() => handlePayInvoice(unpaidInvoices[0])}>
                Pay Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {totalOutstanding === 0 && invoices.length > 0 && (
        <Card className="border-success bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Sparkles className="h-6 w-6 text-success flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-success">You're All Paid Up!</h3>
                <p className="text-sm text-muted-foreground">
                  No outstanding payments. Your account is in good standing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Membership</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold">
                {activeMembership?.membership_plans?.name || 'None'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rewards Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-success" />
              <span className="text-2xl font-bold text-success">{formatCurrency(rewardsBalance)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Services Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Purchase Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Buy Membership
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Choose from our flexible membership plans
              </p>
              <Button onClick={() => window.location.href = '/membership/plans'}>
                View Plans
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Personal Training
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Book sessions with our certified trainers
              </p>
              <Button onClick={() => window.location.href = '/trainers/management'}>
                Browse Trainers
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Shop Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Browse supplements and gym merchandise
              </p>
              <Button onClick={() => window.location.href = '/member/store'}>
                Visit Store
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Billing History */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>All your membership invoices and billing statements</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">#{invoice.invoice_number}</h4>
                          <p className="text-sm text-muted-foreground">{invoice.customer_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(invoice.total)}</p>
                          <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-muted-foreground">Issue Date</p>
                          <p>{format(new Date(invoice.issue_date), 'MMM dd, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Due Date</p>
                          <p>{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Subtotal</p>
                          <p>{formatCurrency(invoice.subtotal)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Tax</p>
                          <p>{formatCurrency(invoice.tax)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {(invoice.status === 'unpaid' || invoice.status === 'overdue') && (
                          <Button 
                            size="sm" 
                            onClick={() => handlePayInvoice(invoice)}
                          >
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No invoices found</p>
                  <p className="text-sm">Your billing history will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All your successful payments and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="space-y-4">
                  {payments.map((payment) => {
                    const invoice = invoices.find(inv => inv.id === payment.invoice_id);
                    return (
                      <div key={payment.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">Payment</h4>
                            <p className="text-sm text-muted-foreground">
                              Invoice: #{invoice?.invoice_number}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-success">
                              {formatCurrency(payment.amount)}
                            </p>
                            <Badge variant="default" className="bg-success">
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Payment Date</p>
                            <p>{format(new Date(payment.payment_date), 'MMM dd, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Method</p>
                            <p className="capitalize">{payment.payment_method.replace('-', ' ')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Reference</p>
                            <p>{payment.reference || 'N/A'}</p>
                          </div>
                        </div>

                        {payment.notes && (
                          <div className="mt-3">
                            <p className="text-sm text-muted-foreground">Notes</p>
                            <p className="text-sm">{payment.notes}</p>
                          </div>
                        )}

                        {payment.discount_code && (
                          <div className="mt-2">
                            <Badge variant="secondary">
                              Discount: {payment.discount_code}
                            </Badge>
                          </div>
                        )}
                        
                        {payment.rewards_used && payment.rewards_used > 0 && (
                          <div className="mt-2">
                            <Badge variant="secondary">
                              Rewards Used: {formatCurrency(payment.rewards_used)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payments found</p>
                  <p className="text-sm">Your payment history will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <UnifiedCheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={checkoutItems}
        onSuccess={() => {
          setCheckoutOpen(false);
          // Refetch data
          window.location.reload();
        }}
      />
    </div>
  );
};
