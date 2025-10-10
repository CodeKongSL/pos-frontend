export interface Brand {
  brandId: string;
  name: string;
  categoryId: string;
  deleted: boolean;
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

export interface Product {
  productId: string;
  name: string;
  barcode: string;
  categoryId: string;
  brandId: string;
  subCategoryId: string;
  costPrice: number;
  sellingPrice: number;
  stockQty: number;
  deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductsByBrandResponse {
  data: Product[];
  per_page: number;
  next_cursor: string | null;
  has_more: boolean;
}