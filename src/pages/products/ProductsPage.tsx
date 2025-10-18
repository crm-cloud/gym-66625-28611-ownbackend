import { Routes, Route, Navigate } from 'react-router-dom';
import { ProductsList } from '@/components/products/ProductsList';
import { ProductForm } from '@/components/products/ProductForm';

export const ProductsPage = () => {
  return (
    <Routes>
      <Route index element={<ProductsList />} />
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
};

export default ProductsPage;
