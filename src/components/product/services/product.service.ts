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
      console.log('Creating product with data:', JSON.stringify(productData, null, 2));
      
      // Generate a unique product ID
      const timestamp = Date.now();
      const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      productData.productId = `PRD-${timestamp}-${randomPart}`;

      console.log('Using product ID:', productData.productId);
      
      // Validate required fields
      if (!productData.categoryId) throw new Error('Category ID is required');
      if (!productData.brandId) throw new Error('Brand ID is required');
      if (!productData.productSubcategories?.length) throw new Error('At least one subcategory is required');
      
      // Validate subcategories data
      productData.productSubcategories.forEach((sub, index) => {
        if (!sub.subcategoryId) throw new Error(`Subcategory ${index + 1}: ID is required`);
        if (sub.quantity <= 0) throw new Error(`Subcategory ${index + 1}: Quantity must be greater than 0`);
        if (!sub.expiryDate) throw new Error(`Subcategory ${index + 1}: Expiry date is required`);
        if (sub.price <= 0) throw new Error(`Subcategory ${index + 1}: Price must be greater than 0`);
      });
      
      console.log('Request URL:', CREATE_PRODUCT_URL);
      console.log('Request payload:', JSON.stringify(productData, null, 2));
      
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
        console.error('Response status:', response.status);
        console.error('Response headers:', [...response.headers.entries()]);
        
        let errorMessage = 'Failed to create product';
        
        try {
          const errorData = JSON.parse(responseText);
          
          // Handle specific error cases
          if (errorData.error?.includes('[ProductId] unique')) {
            errorMessage = 'A product with this combination already exists. Please modify the details and try again.';
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = responseText || 'Invalid server response';
        }
        
        throw new Error(errorMessage);
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