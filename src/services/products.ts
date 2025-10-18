import { api } from '@/lib/axios';
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
  const params = new URLSearchParams();

  if (filters.category) {
    params.append('category', filters.category);
  }
  
  if (filters.is_active !== undefined) {
    params.append('is_active', filters.is_active.toString());
  }
  
  if (filters.search) {
    params.append('search', filters.search);
  }

  const { data } = await api.get(`/api/products?${params.toString()}`);
  return data.products as Product[];
};

export const fetchProductById = async (id: string) => {
  const { data } = await api.get(`/api/products/${id}`);
  return data as Product;
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
  const { data } = await api.post('/api/products', {
    ...product,
    stock_quantity: product.stock_quantity || 0,
    is_active: product.is_active ?? true,
  });

  return data as Product;
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const { data } = await api.patch(`/api/products/${id}`, updates);
  return data as Product;
};

export const deleteProduct = async (id: string) => {
  await api.delete(`/api/products/${id}`);
  return true;
};

// Get unique product categories
export const fetchProductCategories = async () => {
  const { data } = await api.get('/api/products/categories');
  return data.categories || [];
};

// Update product stock
export const updateProductStock = async (productId: string, quantityChange: number) => {
  const product = await fetchProductById(productId);
  const newQuantity = (product.stock_quantity || 0) + quantityChange;
  
  const updatedProduct = await updateProduct(productId, { 
    stock_quantity: Math.max(0, newQuantity)
  });
  
  return updatedProduct;
};

// Invalidate product-related queries
export const invalidateProductQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['products'] });
  queryClient.invalidateQueries({ queryKey: ['categories'] });
};
