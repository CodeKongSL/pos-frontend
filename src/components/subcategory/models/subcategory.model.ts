export interface Subcategory {
  subcategoryId: string;
  name: string;
  brandId: string;
  created_at: string;
  updated_at: string;
}

export interface SubcategoryCreate {
  subcategoryName: string;
  brandId: string;
}

export interface SubcategoryCreateRequest {
  subcategoryName: string;
  brandId: string;
}