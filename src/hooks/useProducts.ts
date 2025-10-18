import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

export const useProducts = (filters?: { branchId?: string; category?: string; search?: string }) => {
  return useSupabaseQuery(
    ['products', filters?.branchId ?? 'all', filters?.category ?? 'all', filters?.search ?? ''],
    async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Map to match Product interface from types
      return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: Number(p.price),
        category: p.category as any,
        image: p.image_url || '',
        stock: p.stock_quantity || 0,
        sku: `SKU-${p.id.substring(0, 8).toUpperCase()}`, // Generate SKU from ID
        isActive: p.is_active ?? true,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }));
    }
  );
};

export const useCreateProduct = () => {
  return useSupabaseMutation(
    async (productData: Partial<Product>) => {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          description: productData.description,
          category: productData.category,
          price: productData.price,
          stock_quantity: productData.stock || 0,
          image_url: productData.image,
          is_active: productData.isActive ?? true
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['products']],
      onSuccess: () => {
        // Success handled by mutation hook
      }
    }
  );
};

export const useUpdateProduct = () => {
  return useSupabaseMutation(
    async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          description: updates.description,
          price: updates.price,
          stock_quantity: updates.stock,
          category: updates.category,
          image_url: updates.image,
          is_active: updates.isActive
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      invalidateQueries: [['products']],
      onSuccess: () => {
        // Success handled by mutation hook
      }
    }
  );
};

export const usePaymentMethods = () => {
  return useSupabaseQuery(
    ['payment_methods'],
    async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    }
  );
};
