export interface CategoryRequest {
  name: string;
  description?: string;
  imageFile?: File | null;
}

export interface CategoryResponse {
  categoryId: number;
  name: string;
  description: string;
  imageUrl: string | null;
  createdAt: string;
}
