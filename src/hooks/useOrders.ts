import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Order, CartItem } from '@/types/product';

export const useOrders = (filters?: { branchId?: string; customerId?: string; status?: string }) => {
  return useQuery({
    queryKey: ['orders', filters?.branchId ?? 'all', filters?.customerId ?? 'all', filters?.status ?? 'all'],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.customerId) {
        params.append('user_id', filters.customerId);
      }
      if (filters?.branchId) {
        params.append('branch_id', filters.branchId);
      }
      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }

      const { data } = await api.get(`/api/orders?${params.toString()}`);
      return data.orders || [];
    }
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: {
      cart: CartItem[];
      customerId?: string;
      customerName: string;
      customerEmail?: string;
      paymentMethod: string;
      notes?: string;
      branchId?: string;
    }) => {
      const subtotal = orderData.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + tax;

      const payload = {
        user_id: orderData.customerId,
        items: orderData.cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price,
          total_price: item.product.price * item.quantity
        })),
        total_amount: total,
        cash_amount: orderData.paymentMethod === 'cash' ? total : 0,
        credit_used: 0,
        payment_method: orderData.paymentMethod,
        status: 'completed',
        branch_id: orderData.branchId,
        notes: orderData.notes
      };

      const { data } = await api.post('/api/orders', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};
