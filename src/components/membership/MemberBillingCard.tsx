import { useState } from 'react';
import { format, differenceInDays, isAfter, isBefore, addDays } from 'date-fns';
import { 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Receipt
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Invoice, PaymentStatus } from '@/types/membership';
import { PaymentRecorderDrawer } from './PaymentRecorderDrawer';
import { useCurrency } from '@/hooks/useCurrency';
import { useInvoices } from '@/hooks/useInvoices';

interface MemberBillingCardProps {
  memberId: string;
  branchId: string; // Add branchId to props
}

const getPaymentStatusInfo = (status: PaymentStatus) => {
  switch (status) {
    case 'paid':
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        label: 'Paid'
      };
    case 'unpaid':
      return {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        label: 'Unpaid'
      };
    case 'partial':
      return {
        icon: CreditCard,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        label: 'Partial'
      };
    case 'overdue':
      return {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        label: 'Overdue'
      };
    default:
      return {
        icon: Clock,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        label: status
      };
  }
};

const getDueDateAlert = (dueDate: Date, paymentStatus: PaymentStatus) => {
  const now = new Date();
  const daysUntilDue = differenceInDays(dueDate, now);
  
  if (paymentStatus === 'paid') return null;
  
  if (isAfter(now, dueDate)) {
    const daysOverdue = Math.abs(daysUntilDue);
    return {
      type: 'error' as const,
      message: `Payment overdue by ${daysOverdue} day${daysOverdue === 1 ? '' : 's'}`
    };
  }
  
  if (daysUntilDue <= 7 && daysUntilDue >= 0) {
    return {
      type: 'warning' as const,
      message: `Payment due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`
    };
  }
  
  return null;
};

export const MemberBillingCard = ({ memberId, branchId }: MemberBillingCardProps) => {
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { formatCurrency } = useCurrency();

  // Fetch invoices for this member
  const { data: allInvoices = [], isLoading } = useInvoices({ customerId: memberId });
  const memberInvoices = allInvoices.filter(invoice => invoice.customerId === memberId);

  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentDrawerOpen(true);
  };

  const handlePaymentRecorded = () => {
    // Update invoice status in real app
    setPaymentDrawerOpen(false);
    setSelectedInvoice(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading billing history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (memberInvoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No invoices found for this member.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {memberInvoices.map((invoice) => {
              const membershipInvoice = {
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                membershipId: '', // Add required field
                memberId: invoice.customerId || '',
                memberName: invoice.customerName,
                planName: 'Membership Plan', // Default since we don't have this field
                originalAmount: invoice.subtotal,
                discountAmount: invoice.discount,
                gstAmount: invoice.tax,
                finalAmount: invoice.total,
                issueDate: new Date(invoice.date),
                dueDate: new Date(invoice.dueDate),
                paymentStatus: (invoice.status === 'paid' ? 'paid' : invoice.status === 'draft' ? 'unpaid' : 'pending') as PaymentStatus,
branchId: branchId,
                branchName: 'Main Branch', // You might want to fetch the actual branch name
                createdAt: new Date(invoice.createdAt)
              };
              
              const statusInfo = getPaymentStatusInfo(membershipInvoice.paymentStatus);
              const dueDateAlert = getDueDateAlert(membershipInvoice.dueDate, membershipInvoice.paymentStatus);
              const StatusIcon = statusInfo.icon;
            return (
              <Card key={membershipInvoice.id} className="border-l-4 border-l-primary">
                <CardContent className="pt-4">
                  {/* Alert for due dates */}
                  {dueDateAlert && (
                    <Alert className={`mb-4 ${
                      dueDateAlert.type === 'error' 
                        ? 'border-red-200 bg-red-50' 
                        : 'border-yellow-200 bg-yellow-50'
                    }`}>
                      <AlertTriangle className={`h-4 w-4 ${
                        dueDateAlert.type === 'error' ? 'text-red-600' : 'text-yellow-600'
                      }`} />
                      <AlertDescription className={
                        dueDateAlert.type === 'error' ? 'text-red-800' : 'text-yellow-800'
                      }>
                        {dueDateAlert.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold">{membershipInvoice.invoiceNumber}</h4>
                        <Badge 
                          variant="secondary" 
                          className={`${statusInfo.bgColor} ${statusInfo.color} hover:${statusInfo.bgColor}`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{membershipInvoice.planName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatCurrency(membershipInvoice.finalAmount)}
                      </p>
                      {membershipInvoice.paymentStatus === 'partial' && (
                        <p className="text-sm text-yellow-600 font-medium">
                          Partial Payment
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Issue Date</p>
                      <p>{format(membershipInvoice.issueDate, 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Due Date</p>
                      <p className={isAfter(new Date(), membershipInvoice.dueDate) && membershipInvoice.paymentStatus !== 'paid' 
                        ? 'text-red-600 font-medium' 
                        : ''}>
                        {format(membershipInvoice.dueDate, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  {/* Amount Breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Original Amount:</span>
                      <span>{formatCurrency(membershipInvoice.originalAmount)}</span>
                    </div>
                    {membershipInvoice.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-{formatCurrency(membershipInvoice.discountAmount)}</span>
                      </div>
                    )}
                    {membershipInvoice.gstAmount > 0 && (
                      <div className="flex justify-between">
                        <span>GST (18%):</span>
                        <span>+{formatCurrency(membershipInvoice.gstAmount)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total Amount:</span>
                      <span>{formatCurrency(membershipInvoice.finalAmount)}</span>
                    </div>
                  </div>

                  {/* Payment Action */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.open(`/finance/invoices/${membershipInvoice.id}`, '_blank')}
                      >
                        <Receipt className="h-4 w-4 mr-2" />
                        View Invoice
                      </Button>
                      {membershipInvoice.paymentStatus !== 'paid' ? (
                        <Button 
                          onClick={() => handleRecordPayment(membershipInvoice)}
                          className="w-full"
                          variant={membershipInvoice.paymentStatus === 'overdue' ? 'destructive' : 'default'}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Record Payment
                        </Button>
                      ) : (
                        <div></div> // Empty div to maintain grid layout
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Payment Recorder Drawer */}
      {selectedInvoice && (
        <PaymentRecorderDrawer
          open={paymentDrawerOpen}
          onClose={() => setPaymentDrawerOpen(false)}
          invoice={selectedInvoice}
          onPaymentRecorded={handlePaymentRecorded}
        />
      )}
    </>
  );
};