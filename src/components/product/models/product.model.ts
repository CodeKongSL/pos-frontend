export interface Product {
  productId: string;
  name: string;
  barcode?: string;
  categoryId: string;
  brandId: string;
  subCategoryId?: string;
  description?: string;
  costPrice: number;
  sellingPrice: number;
  stockQty: number;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
  deleted: boolean;
  productSubcategories?: ProductSubcategory[];
}

export interface ProductSubcategory {
  subcategoryId: string;
  quantity: number;
  expiryDate: string;
  price: number;
}

export interface ProductCreate {
  name: string;
  barcode?: string;
  categoryId: string;
  brandId: string;
  subcategoryId: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  stockQty: number;
  productSubcategories: ProductSubcategory[];
}

export interface ProductCreateRequest {
  productId?: string;
  name: string;
  categoryId: string;
  brandId: string;
  subCategoryId: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  stockQty: number;
  barcode?: string;
  expiry_date?: string;
  productSubcategories: ProductSubcategory[];
}

export interface PaginatedProductResponse {
  data: Product[];
  per_page: number;
  next_cursor: string | null;
  has_more: boolean;
}

export interface ProductPaginationParams {
  per_page?: number;
  cursor?: string;
}