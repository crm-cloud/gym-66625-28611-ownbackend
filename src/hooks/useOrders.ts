import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { Order, CartItem } from '@/types/product';

export const useOrders = (filters?: { branchId?: string; customerId?: string; status?: string }) => {
  return useSupabaseQuery(
    ['orders', filters?.branchId ?? 'all', filters?.customerId ?? 'all', filters?.status ?? 'all'],
    async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (filters?.customerId) {
        query = query.eq('user_id', filters.customerId);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  );
};

export const useCreateOrder = () => {
  return useSupabaseMutation(
    async (orderData: {
      cart: CartItem[];
      customerId?: string;
      customerName: string;
      customerEmail?: string;
      paymentMethod: string;
      notes?: string;
      branchId?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const subtotal = orderData.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + tax;

      // Generate order number
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      const orderNumber = `POS-${String((orderCount || 0) + 1).padStart(5, '0')}`;

      // Create order (matching existing schema)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_number: orderNumber,
          user_id: orderData.customerId || userData.user?.id,
          total_amount: total,
          cash_amount: orderData.paymentMethod === 'cash' ? total : 0,
          credit_used: 0,
          payment_method: orderData.paymentMethod,
          status: 'completed',
          payment_reference: `REF-${Date.now()}`
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of orderData.cart) {
        // Get current stock
        const { data: product } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product.id)
          .single();
        
        if (product) {
          await supabase
            .from('products')
            .update({
              stock_quantity: Math.max(0, (product.stock_quantity || 0) - item.quantity)
            })
            .eq('id', item.product.id);
        }
      }

      return order;
    },
    {
      invalidateQueries: [['orders'], ['products']],
      onSuccess: () => {
        // Success handled by mutation hook
      }
    }
  );
};
