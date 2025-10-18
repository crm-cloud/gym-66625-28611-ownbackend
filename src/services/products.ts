import { supabase } from '@/integrations/supabase/client';
import { QueryClient } from '@tanstack/react-query';

export interface Product {
  id?: string;
  name: string;
  description: string | null;
  price: number;
  member_price: number | null;
  category: string;
  image_url: string | null;
  stock_quantity: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Product CRUD Operations
export const fetchProducts = async (filters: {
  category?: string;
  is_active?: boolean;
  search?: string;
} = {}) => {
  let query = supabase
    .from('products')
    .select('*');

  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }
  
  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  const { data, error } = await query.order('name');
  
  if (error) throw error;
  return data as Product[];
};

export const fetchProductById = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Product;
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('products')
    .insert([{
      ...product,
      stock_quantity: product.stock_quantity || 0,
      is_active: product.is_active ?? true,
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data as Product;
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// Get unique product categories
export const fetchProductCategories = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .not('category', 'is', null);
    
  if (error) throw error;
  
  // Extract unique categories
  const categories = new Set(data.map(item => item.category).filter(Boolean));
  return Array.from(categories).sort();
};

// Update product stock
export const updateProductStock = async (productId: string, quantityChange: number) => {
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('stock_quantity')
    .eq('id', productId)
    .single();
    
  if (fetchError) throw fetchError;
  
  const newQuantity = (product.stock_quantity || 0) + quantityChange;
  
  const { data, error: updateError } = await supabase
    .from('products')
    .update({ 
      stock_quantity: Math.max(0, newQuantity),
      updated_at: new Date().toISOString()
    })
    .eq('id', productId)
    .select()
    .single();
    
  if (updateError) throw updateError;
  return data as Product;
};

// Invalidate product-related queries
export const invalidateProductQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['products'] });
  queryClient.invalidateQueries({ queryKey: ['categories'] });
};
