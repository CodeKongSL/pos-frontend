export interface Category {
  categoryId: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreate {
  categoryName: string;
}

export interface CategoryCreateRequest {
  categoryName: string;  // Changed to lowercase to match API expectation
}