import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, CheckCircle, Edit } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  amount: number; // total
  subtotal?: number;
  tax?: number;
  discount?: number;
  notes?: string;
  status: string;
  dueDate: string;
  createdAt: string;
  description: string;
}

interface InvoiceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  onDownload: (type: 'pdf' | 'gst' | 'non-gst') => void;
  onMarkAsPaid: () => void;
}

export function InvoiceDetailsDialog({ 
  open, 
  onOpenChange, 
  invoice, 
  onDownload, 
  onMarkAsPaid 
}: InvoiceDetailsDialogProps) {
  const { formatCurrency } = useCurrency();

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'sent': return 'secondary';
      case 'overdue': return 'destructive';
      case 'draft': return 'outline';
      case 'cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice Details - {invoice.invoiceNumber}</span>
            <Badge variant={getStatusBadgeVariant(invoice.status)}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Bill To:</h4>
                  <p className="font-medium">{invoice.customerName}</p>
                  {invoice.customerEmail && (
                    <p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Invoice Details:</h4>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Created:</span> {invoice.createdAt}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Due Date:</span> {invoice.dueDate}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-4">Description</h4>
              <p className="mb-4">{invoice.description}</p>
              
              <Separator className="my-4" />
              
              <div className="space-y-2 text-sm">
                {typeof invoice.subtotal === 'number' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(invoice.subtotal || 0)}</span>
                  </div>
                )}
                {typeof invoice.tax === 'number' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">{formatCurrency(invoice.tax || 0)}</span>
                  </div>
                )}
                {typeof invoice.discount === 'number' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium">{formatCurrency(invoice.discount || 0)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold">{formatCurrency(invoice.amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {invoice.status !== 'paid' && (
              <Button onClick={onMarkAsPaid} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Paid
              </Button>
            )}
            
            <Button variant="outline" onClick={() => onDownload('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            
            <Button variant="outline" onClick={() => onDownload('gst')}>
              <Download className="w-4 h-4 mr-2" />
              GST Invoice
            </Button>
            
            <Button variant="outline" onClick={() => onDownload('non-gst')}>
              <Download className="w-4 h-4 mr-2" />
              Non-GST Invoice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}