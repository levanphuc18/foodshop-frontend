export type OrderStatus = 'PENDING' | 'PAID' | 'CONFIRMED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export interface OrderRequest {
  shippingAddress: string;
  shippingNote?: string;
  discountCode?: string;
}

export interface OrderItemResponse {
  orderItemId: number;
  productId: number;
  productName: string;
  productImageUrl: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResponse {
  orderId: number;
  shippingAddress: string;
  shippingNote: string;
  status: OrderStatus;
  createdAt: string;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  shippingDiscount: number;
  finalAmount: number;
  discountCode: string | null;
  userId: number;
  username?: string | null;
  fullName?: string | null;
  orderItems: OrderItemResponse[];
}
