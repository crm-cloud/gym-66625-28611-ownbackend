import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types/product';
import { format } from 'date-fns';

interface InvoiceGeneratorProps {
  order: Order;
}

export const InvoiceGenerator = ({ order }: InvoiceGeneratorProps) => {
  const invoiceNumber = `INV-${order.orderNumber.replace('POS-', '')}`;
  
  return (
    <Card className="w-full max-w-2xl mx-auto print:shadow-none print:border-none">
      <CardHeader className="text-center border-b">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">GymFit Pro</h1>
          <p className="text-muted-foreground">123 Fitness Street, Gym City, GC 12345</p>
          <p className="text-muted-foreground">Phone: (555) 123-4567 | Email: info@gymfitpro.com</p>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Invoice Header */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Invoice</h2>
            <div className="space-y-1 text-sm">
              <p><strong>Invoice #:</strong> {invoiceNumber}</p>
              <p><strong>Order #:</strong> {order.orderNumber}</p>
              <p><strong>Date:</strong> {format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
              <p><strong>Time:</strong> {format(new Date(order.createdAt), 'HH:mm')}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Customer Details</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Name:</strong> {order.customerName}</p>
              {order.customerEmail && (
                <p><strong>Email:</strong> {order.customerEmail}</p>
              )}
              {order.customerId && (
                <p><strong>Member ID:</strong> {order.customerId}</p>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Items Table */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Items</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-center p-3 font-medium">Qty</th>
                  <th className="text-right p-3 font-medium">Price</th>
                  <th className="text-right p-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {item.product.sku}</p>
                      </div>
                    </td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">${item.product.price.toFixed(2)}</td>
                    <td className="p-3 text-right font-medium">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (8%):</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Payment Info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Payment Information</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Method:</strong> {order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Status:</strong> 
                <Badge variant="secondary" className="ml-2">
                  {order.paymentStatus.toUpperCase()}
                </Badge>
              </p>
            </div>
          </div>
          
          {order.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>Thank you for your business!</p>
          <p className="mt-1">Visit us at www.gymfitpro.com</p>
        </div>
      </CardContent>
    </Card>
  );
};