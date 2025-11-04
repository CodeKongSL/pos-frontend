export interface Batch {
  batchId: string;
  stockQty: number;
  expiry_date?: string;
  costPrice: number;
  sellingPrice: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  productId: string;
  name: string;
  barcode?: string;
  categoryId: string;
  categoryName?: string;  // Added by backend optimization
  brandId: string;
  brandName?: string;     // Added by backend optimization
  subCategoryId?: string;
  description?: string;
  costPrice: number;
  sellingPrice: number;
  stockQty: number;  // Total of all batches
  expiry_date?: string;
  batches?: Batch[];  // Array of batches
  deleted: boolean;
  created_at: string;
  updated_at: string;
  productSubcategories?: any[];
}