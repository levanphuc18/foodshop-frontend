export interface DiscountResponse {
  discountId: number;
  code: string;
  type: 'ORDER' | 'PRODUCT' | 'SHIPPING';
  discountUnit: 'PERCENT' | 'AMOUNT';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number | null;
  usedCount: number;
  perUserLimit?: number | null;
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
  usageLimit?: number;
  perUserLimit?: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DISABLED';
}

export interface CouponValidationResponse {
  valid: boolean;
  code: string;
  type?: 'ORDER' | 'SHIPPING';
  discountUnit?: 'PERCENT' | 'AMOUNT';
  value?: number;
  discountAmount?: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  message: string;
}
