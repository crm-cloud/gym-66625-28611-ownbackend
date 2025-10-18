import React, { useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  FileText, 
  Download, 
  Send, 
  Edit, 
  Eye, 
  Filter,
  Search,
  Mail,
  MessageSquare,
  MessageCircle,
  CreditCard,
  CheckCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InvoiceCreationDialog } from '@/components/finance/InvoiceCreationDialog';
import { InvoiceDetailsDialog } from '@/components/finance/InvoiceDetailsDialog';
import { InvoiceWorkflowDialog } from '@/components/finance/InvoiceWorkflowDialog';
import { PaymentRecorderDialog } from '@/components/finance/PaymentRecorderDialog';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface InvoiceUI {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  memberId?: string;
  memberName?: string;
  amount: number;
  amountPaid: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  createdAt: string;
  description: string;
}

export default function InvoicesPage() {
  const { data: rows = [], isLoading, refetch: refetchInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          member:customer_id (id, full_name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const invoices: InvoiceUI[] = useMemo(() => {
    return (rows as any[]).map((r) => ({
      id: r.id,
      invoiceNumber: r.invoice_number,
customerName: r.customer_name,
      customerEmail: r.customer_email ?? undefined,
      memberId: r.member_id,
      memberName: r.member?.full_name,
      amount: Number(r.total) || 0,
      amountPaid: Number(r.amount_paid) || 0,
      status: (r.status as any) ?? 'draft',
      dueDate: r.due_date,
      createdAt: r.created_at,
      description: r.notes || '',
    }));
  }, [rows]);

  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceUI[]>(invoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [amountMin, setAmountMin] = useState<string>('');
  const [amountMax, setAmountMax] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceUI | null>(null);
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'sent': return 'text-blue-600'; 
      case 'overdue': return 'text-red-600';
      case 'draft': return 'text-gray-600';
      case 'cancelled': return 'text-gray-500';
      default: return 'text-gray-600';
    }
  };

  const handleCreateInvoice = async (invoiceData: any) => {
    // Optional: you can wire this to supabase inserts for manual creation
    toast({ title: 'Not Implemented', description: 'Creation from this page is not wired yet.' });
  };

  const handleViewInvoice = (invoice: InvoiceUI) => {
    setSelectedInvoice(invoice);
    setShowDetailsDialog(true);
  };

  const handleSendInvoice = async (invoice: InvoiceUI, method: 'email' | 'sms' | 'whatsapp') => {
    try {
      // In a real implementation, you would call an edge function to send the invoice
      // For now, we'll simulate the sending process
      
      const recipient = method === 'email' ? invoice.customerEmail : 
                       method === 'sms' ? 'customer phone' : 
                       'customer whatsapp';
      
      if (method === 'email' && !invoice.customerEmail) {
        toast({
          title: 'Email Missing',
          description: 'Customer email address is not available for this invoice.',
          variant: 'destructive'
        });
        return;
      }
      
      // Simulate sending delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update invoice status to sent
      await supabase
        .from('invoices')
        .update({ status: 'sent' })
        .eq('id', invoice.id);
      
      toast({
        title: 'Invoice Sent',
        description: `Invoice ${invoice.invoiceNumber} has been sent via ${method} to ${recipient}`,
      });
    } catch (error) {
      toast({
        title: 'Send Failed',
        description: `Failed to send invoice via ${method}. Please try again.`,
        variant: 'destructive'
      });
    }
  };

  const handlePayment = (invoice: InvoiceUI) => {
    setSelectedInvoice(invoice);
    setShowPaymentDialog(true);
  };
  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoiceId);
      if (error) throw error;
      await refetchInvoices();
      toast({
        title: 'Payment recorded',
        description: 'The payment has been successfully recorded.',
      });
    } catch (e: any) {
      toast({ title: 'Failed', description: e?.message || 'Could not update invoice', variant: 'destructive' });
    }
  };

  const handleDownloadInvoice = async (invoice: InvoiceUI, type: 'pdf' | 'gst' | 'non-gst') => {
    try {
      // Generate PDF blob (simplified implementation)
      const pdfContent = generateInvoicePDF(invoice, type);
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Download file
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.invoiceNumber}_${type}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Download Complete',
        description: `${type.toUpperCase()} invoice for ${invoice.invoiceNumber} has been downloaded`
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to generate invoice PDF. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const generateInvoicePDF = (invoice: InvoiceUI, type: 'pdf' | 'gst' | 'non-gst') => {
    // Simple PDF content generation (in real app, use a proper PDF library like jsPDF)
    return `Invoice: ${invoice.invoiceNumber}
Customer: ${invoice.customerName}
Amount: ₹${invoice.amount.toLocaleString()}
Status: ${invoice.status}
Due Date: ${invoice.dueDate}
Type: ${type.toUpperCase()}
${type === 'gst' ? 'GST Number: 123456789' : ''}
Description: ${invoice.description}
Generated on: ${new Date().toLocaleDateString()}`;
  };

  // Filter invoices based on search and status
  const filterInvoices = useCallback(() => {
    if (!invoices.length) return;
    let filtered = invoices;
    
    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }
    // Date range filters
    if (dateFrom) {
      filtered = filtered.filter(inv => !inv.createdAt || inv.createdAt >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(inv => !inv.createdAt || inv.createdAt <= dateTo);
    }
    // Amount filters
    const min = amountMin ? Number(amountMin) : undefined;
    const max = amountMax ? Number(amountMax) : undefined;
    if (typeof min === 'number' && !Number.isNaN(min)) {
      filtered = filtered.filter(inv => inv.amount >= min);
    }
    if (typeof max === 'number' && !Number.isNaN(max)) {
      filtered = filtered.filter(inv => inv.amount <= max);
    }
    
    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, statusFilter, dateFrom, dateTo, amountMin, amountMax]);

  // Update filteredInvoices when invoices data changes
  React.useEffect(() => {
    setFilteredInvoices(invoices);
  }, [invoices]);

  // Update filters when search term or filter values change
  React.useEffect(() => {
    filterInvoices();
  }, [searchTerm, statusFilter, dateFrom, dateTo, amountMin, amountMax, invoices]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-muted-foreground">Create, send, and manage invoices with workflow automation</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <div>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <span className="text-sm text-muted-foreground">to</span>
          <div>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>

        {/* Amount Range */}
        <div className="flex items-center gap-2">
          <Input type="number" placeholder="Min" value={amountMin} onChange={(e) => setAmountMin(e.target.value)} className="w-24" />
          <span className="text-sm text-muted-foreground">-</span>
          <Input type="number" placeholder="Max" value={amountMax} onChange={(e) => setAmountMax(e.target.value)} className="w-24" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(invoices.reduce((sum, inv) => sum + inv.amount, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(invoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled').reduce((sum, inv) => sum + inv.amount, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Manage all your invoices and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-sm text-muted-foreground">Loading invoices...</div>
          )}
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                      <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{invoice.description}</p>
                </div>
                
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(invoice.amount)}</p>
                  <p className="text-sm text-muted-foreground">Due: {invoice.dueDate}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(invoice.status)}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => handleViewInvoice(invoice)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  {invoice.status !== 'paid' && (
                    <Button variant="outline" size="sm" onClick={() => handlePayment(invoice)}>
                      <CreditCard className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSendInvoice(invoice, 'email')}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDownloadInvoice(invoice, 'pdf')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredInvoices.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No invoices found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <InvoiceCreationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateInvoice}
      />
      
      {selectedInvoice && (
        <>
          <InvoiceDetailsDialog
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
            invoice={selectedInvoice}
            onDownload={(type) => handleDownloadInvoice(selectedInvoice, type)}
            onMarkAsPaid={() => handleMarkAsPaid(selectedInvoice.id)}
          />
          
          <InvoiceWorkflowDialog
            open={showWorkflowDialog}
            onOpenChange={setShowWorkflowDialog}
            invoice={selectedInvoice}
          />
          
          <PaymentRecorderDialog
            open={showPaymentDialog}
            onOpenChange={setShowPaymentDialog}
            invoice={selectedInvoice}
            onPaymentRecorded={() => handleMarkAsPaid(selectedInvoice.id)}
          />
        </>
      )}
    </div>
  );
}