export interface CartItemRequest {
  productId: number;
  userId: number;
  quantity: number;
}

export interface CartItemResponse {
  userId: number;
  username: string;
  productId: number;
  productName: string;
  productPrice: number;
  productImageUrl: string | null;
  quantity: number;
}
