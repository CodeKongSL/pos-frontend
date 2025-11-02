export interface Category {
  categoryId: string;
  name: string;
  deleted: boolean;
  created_at: string;
  updated_at: string;
  product_count?: number; // Added by backend optimization
}

export interface CategoryCreate {
  categoryName: string;
}

export interface CategoryCreateRequest {
  categoryName: string;  // Changed to lowercase to match API expectation
}

export interface CategoryPaginationResponse {
  data: Category[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface CategoryPaginationParams {
  page?: number;
  per_page?: number;
}

export interface ProductsByCategoryResponse {
  data: any[];
  per_page: number;
  next_cursor: string | null;
  has_more: boolean;
}

export interface ProductCountResponse {
  count: number;
}

export interface CategorySearchParams {
  q: string;
  limit?: number;
}

export interface CategorySearchResponse {
  data: Category[];
}