export interface Product {
  productId: string;
  categoryId: string;
  brandId: string;
  description: string;
  created_at: string;
  updated_at: string;
  productSubcategories: ProductSubcategory[];
}

export interface ProductSubcategory {
  subcategoryId: string;
  quantity: number;
  expiryDate: string;
  price: number;
}

export interface ProductCreate {
  categoryId: string;
  brandId: string;
  description: string;
  productSubcategories: ProductSubcategory[];
}

export interface ProductCreateRequest {
  productId?: string;
  categoryId: string;
  brandId: string;
  description: string;
  productSubcategories: ProductSubcategory[];
}