export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  branchId: string;
  customerId?: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number;
  status: OrderStatus;
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
}

export interface CreateOrderInput {
  branchId: string;
  customerId?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  discountAmount?: number;
  taxAmount?: number;
  paymentMethod?: string;
  notes?: string;
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  paymentStatus?: string;
  notes?: string;
}

export interface OrderFilters {
  branchId?: string;
  customerId?: string;
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}
