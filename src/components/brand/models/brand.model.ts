export interface Brand {
  brandId: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface BrandCreate {
  brandName: string;
}

export interface BrandCreateRequest {
  brandName: string;
}