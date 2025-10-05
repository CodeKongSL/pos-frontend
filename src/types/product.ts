export interface Product {
  productId: string;
  name: string;
  barcode?: string;
  categoryId: string;
  brandId: string;
  subcategoryId?: string;
  description?: string;
  costPrice: number;
  sellingPrice: number;
  stockQty: number;
  deleted: boolean;
  created_at: string;
  updated_at: string;
  productSubcategories?: any[];
}