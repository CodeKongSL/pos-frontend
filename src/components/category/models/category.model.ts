export interface Category {
  categoryId: string;
  name: string;
  deleted: boolean;
  created_at: string;
  updated_at: string;
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