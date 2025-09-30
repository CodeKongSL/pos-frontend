import { Product, ProductCreate, ProductCreateRequest } from '../models/product.model';

const API_BASE_URL = 'https://my-go-backend.onrender.com';

const FIND_ALL_PRODUCTS_URL = `${API_BASE_URL}/FindAllProducts`;
const CREATE_PRODUCT_URL = `${API_BASE_URL}/CreateProduct`;

export const ProductService = {
  async getAllProducts(): Promise<Product[]> {
    try {
      console.log('Making API request to:', FIND_ALL_PRODUCTS_URL);
      const response = await fetch(FIND_ALL_PRODUCTS_URL);
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      console.log('Raw API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async createProduct(productData: ProductCreateRequest): Promise<Product> {
    try {
      console.log('Creating product with data:', productData);
      
      // Validate required fields
      if (!productData.categoryId) throw new Error('Category ID is required');
      if (!productData.brandId) throw new Error('Brand ID is required');
      if (!productData.productSubcategories?.length) throw new Error('At least one subcategory is required');
      
      console.log('Request URL:', CREATE_PRODUCT_URL);
      
      const response = await fetch(CREATE_PRODUCT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        console.error('Server error response:', responseText);
        throw new Error(responseText || 'Failed to create product');
      }

      // Try to parse the response as JSON if it's not empty
      const data = responseText ? JSON.parse(responseText) : {};

      return data as Product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create product');
    }
  }
};