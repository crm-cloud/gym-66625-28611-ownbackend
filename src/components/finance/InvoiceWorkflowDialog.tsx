import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/hooks/useCurrency';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
  description: string;
}

interface InvoiceWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
}

export function InvoiceWorkflowDialog({ open, onOpenChange, invoice }: InvoiceWorkflowDialogProps) {
  const [selectedChannel, setSelectedChannel] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  const channelTemplates = {
    email: {
      subject: `Invoice ${invoice.invoiceNumber} from Your Gym`,
      message: `Dear ${invoice.customerName},

Please find attached your invoice for ${invoice.description}.

Invoice Details:
- Invoice Number: ${invoice.invoiceNumber}
- Amount: ${formatCurrency(invoice.amount)}
- Due Date: ${invoice.dueDate}

You can view and pay your invoice online using the link below.

Thank you for your business!`
    },
    sms: {
      message: `Hi ${invoice.customerName}, your invoice ${invoice.invoiceNumber} for ${formatCurrency(invoice.amount)} is ready. Due: ${invoice.dueDate}. View & pay: [link]`
    },
    whatsapp: {
      message: `🧾 *Invoice Ready - ${invoice.invoiceNumber}*

Hi ${invoice.customerName}! 👋

Your invoice is ready:
💰 Amount: ${formatCurrency(invoice.amount)}
📅 Due Date: ${invoice.dueDate}
📋 Description: ${invoice.description}

Click the link below to view and pay:
[Payment Link]

Thank you! 🙏`
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    
    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: 'Invoice Sent Successfully',
      description: `Invoice ${invoice.invoiceNumber} has been sent via ${selectedChannel}.`,
    });
    
    setIsSending(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send Invoice - {invoice.invoiceNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Customer</Label>
                  <p className="font-medium">{invoice.customerName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Amount</Label>
                  <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Due Date</Label>
                  <p className="font-medium">{invoice.dueDate}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge variant="secondary">{invoice.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Channel Selection */}
          <Tabs value={selectedChannel} onValueChange={(value) => setSelectedChannel(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Template
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email-subject">Subject</Label>
                    <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                      {channelTemplates.email.subject}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email-message">Message</Label>
                    <Textarea
                      id="email-message"
                      value={customMessage || channelTemplates.email.message}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={8}
                      className="mt-1"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    📎 Invoice PDF will be automatically attached
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sms" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    SMS Template
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sms-message">Message</Label>
                    <Textarea
                      id="sms-message"
                      value={customMessage || channelTemplates.sms.message}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={4}
                      className="mt-1"
                      maxLength={160}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {(customMessage || channelTemplates.sms.message).length}/160 characters
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="whatsapp" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp Template
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="whatsapp-message">Message</Label>
                    <Textarea
                      id="whatsapp-message"
                      value={customMessage || channelTemplates.whatsapp.message}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={6}
                      className="mt-1"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    💡 Emojis and formatting will be preserved in WhatsApp
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isSending}>
              {isSending ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invoice
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}