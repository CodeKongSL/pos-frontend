export interface Brand {
  brandId: string;
  name: string;
  categoryId: string;
  deleted: boolean;
  created_at: string;
  updated_at: string;
  product_count?: number; // Added by backend optimization
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

export interface BrandPaginationResponse {
  data: Brand[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface BrandPaginationParams {
  page?: number;
  per_page?: number;
}

export interface BrandCostSummary {
  brand_id: string;
  sales_target: number;
  target_profit: number;
  total_spend: number;
}

export interface DisplayBrand {
  id: string;
  name: string;
  expectedProfit: string;
  totalCost: string;
  totalSales: string;
}

export interface TotalCostSummary {
  sales_target: number;
  target_profit: number;
  total_spend: number;
}

export interface ProductCountResponse {
  count: number;
}

export interface BrandSearchParams {
  q: string;
  limit?: number;
}

export interface BrandSearchResponse {
  data: Brand[];
}