import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Invoice } from '@/types/finance';

export interface UseInvoicesOptions {
  limit?: number;
  status?: string;
  customerId?: string;
  branchId?: string;
}

export const useInvoices = (options: UseInvoicesOptions = {}) => {
  return useQuery({
    queryKey: ['invoices', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.status && options.status !== 'all') params.append('status', options.status);
      if (options.customerId) params.append('customer_id', options.customerId);
      if (options.branchId) params.append('branch_id', options.branchId);

      const { data } = await api.get(`/api/invoices?${params.toString()}`);

      // Transform data to match Invoice interface
      return (data.invoices || []).map((invoice: any) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        date: invoice.date,
        dueDate: invoice.due_date,
        customerId: invoice.customer_id,
        customerName: invoice.customer_name,
        customerEmail: invoice.customer_email,
        items: [],
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        discount: invoice.discount,
        total: invoice.total,
        status: invoice.status as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
        notes: invoice.notes,
        createdAt: invoice.created_at,
        updatedAt: invoice.updated_at,
      })) as Invoice[];
    }
  });
};

export const useRecentInvoices = (gymId?: string, limit: number = 5) => {
  return useQuery({
    queryKey: ['recent-invoices', gymId, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('sort', 'created_at');
      params.append('order', 'desc');

      const { data } = await api.get(`/api/invoices?${params.toString()}`);

      return (data.invoices || []).map((invoice: any) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        date: invoice.date,
        amount: invoice.total,
        status: invoice.status === 'paid' ? 'Paid' : 
                invoice.status === 'overdue' ? 'Overdue' :
                invoice.status === 'sent' ? 'Sent' : 'Draft',
        customerName: invoice.customer_name,
        createdAt: invoice.created_at
      }));
    }
  });
};
