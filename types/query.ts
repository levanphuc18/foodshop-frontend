export type SortDir = 'ASC' | 'DESC';

export interface PageQuery {
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: SortDir;
}

export interface AdminOrderQuery extends PageQuery {
  status?: string;
}

export interface AdminUserQuery extends PageQuery {
  role?: string;
  enabled?: boolean;
}

export interface AdminDiscountQuery extends PageQuery {
  status?: string;
  type?: string;
}

export interface ProductQuery extends PageQuery {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface AdminProductQuery extends ProductQuery {
  status?: string;
  isActive?: boolean;
}
