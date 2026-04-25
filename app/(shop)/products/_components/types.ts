export interface ProductListItem {
  id: string;
  title: string;
  price: number;
  originalPrice: number | null;
  discountPercentage: number | null;
  discountUnit: string | null;
  discountType: string | null;
  maxDiscount: number | null;
  tag: string;
  category: string;
  origin: string;
  badge: string;
  img: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  quantity: number;
}

export interface FilterGroupProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}
