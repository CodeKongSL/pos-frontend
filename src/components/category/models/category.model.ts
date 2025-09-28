export interface Category {
  categoryId: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreate {
  name: string;
}