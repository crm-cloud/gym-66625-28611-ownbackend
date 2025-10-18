export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string;
  stock: number;
  sku: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  createdBy: string; // Staff member who created the order
  notes?: string;
}

export type ProductCategory = 
  | 'supplements' 
  | 'apparel' 
  | 'equipment' 
  | 'accessories' 
  | 'beverages' 
  | 'snacks';

export type PaymentMethod = 
  | 'cash' 
  | 'card' 
  | 'digital_wallet' 
  | 'member_credit' 
  | 'complimentary';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded' 
  | 'partially_refunded';

export type OrderStatus = 
  | 'draft' 
  | 'processing' 
  | 'completed' 
  | 'cancelled';

export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  customerInfo: {
    name: string;
    email?: string;
    memberId?: string;
  };
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  issuedAt: string;
  issuedBy: string;
}