import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Product } from '@/types/product';

export const useProducts = (filters?: { branchId?: string; category?: string; search?: string }) => {
  return useQuery({
    queryKey: ['products', filters?.branchId ?? 'all', filters?.category ?? 'all', filters?.search ?? ''],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters?.branchId) {
        params.append('branch_id', filters.branchId);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }
      params.append('is_active', 'true');

      const { data } = await api.get(`/api/products?${params.toString()}`);
      
      // Map backend response to Product interface
      return (data.products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: Number(p.price),
        category: p.category as any,
        image: p.image_url || '',
        stock: p.stock_quantity || 0,
        sku: p.sku || `SKU-${p.id.substring(0, 8).toUpperCase()}`,
        isActive: p.is_active ?? true,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }));
    }
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      const { data } = await api.post('/api/products', {
        name: productData.name,
        description: productData.description,
        category: productData.category,
        price: productData.price,
        stock_quantity: productData.stock || 0,
        image_url: productData.image,
        is_active: productData.isActive ?? true,
        sku: productData.sku,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
      const { data } = await api.patch(`/api/products/${id}`, {
        name: updates.name,
        description: updates.description,
        price: updates.price,
        stock_quantity: updates.stock,
        category: updates.category,
        image_url: updates.image,
        is_active: updates.isActive,
        sku: updates.sku,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['payment_methods'],
    queryFn: async () => {
      const { data } = await api.get('/api/payment-methods');
      return data || [];
    }
  });
};
