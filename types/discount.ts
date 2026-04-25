export interface DiscountResponse {
  discountId: number;
  code: string;
  type: 'ORDER' | 'PRODUCT' | 'SHIPPING';
  discountUnit: 'PERCENT' | 'AMOUNT';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DISABLED';
}

export interface DiscountRequest {
  code: string;
  type: 'ORDER' | 'PRODUCT' | 'SHIPPING';
  discountUnit: 'PERCENT' | 'AMOUNT';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DISABLED';
}

/** Response từ API validate coupon (để preview trước khi đặt hàng) */
export interface CouponValidationResponse {
  valid: boolean;
  code: string;
  type?: 'ORDER' | 'SHIPPING';
  discountUnit?: 'PERCENT' | 'AMOUNT';
  value?: number;
  /** Số tiền thực tế được giảm (đã tính theo đơn hàng) */
  discountAmount?: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  message: string;
}