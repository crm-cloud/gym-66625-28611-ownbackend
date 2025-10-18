import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
      let query = supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.status && options.status !== 'all') {
        query = query.eq('status', options.status as any);
      }

      if (options.customerId) {
        query = query.eq('customer_id', options.customerId);
      }

      if (options.branchId) {
        query = query.eq('branch_id', options.branchId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match Invoice interface
      return (data || []).map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        date: invoice.date,
        dueDate: invoice.due_date,
        customerId: invoice.customer_id,
        customerName: invoice.customer_name,
        customerEmail: invoice.customer_email,
        items: [], // Will be populated from invoice_items if needed
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
      let query = supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (gymId) {
        // In a real app, you'd filter by gym_id through branches
        // For now, we'll fetch all recent invoices
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(invoice => ({
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