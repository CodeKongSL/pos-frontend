export interface Brand {
  brandId: string;
  name: string;
  categoryId: string;
  created_at: string;
  updated_at: string;
}

export interface BrandCreate {
  name: string;
  categoryId: string;
}

export interface BrandCreateRequest {
  name: string;
  categoryId: string;
}