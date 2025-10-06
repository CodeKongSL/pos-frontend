import { Product, ProductCreate, ProductCreateRequest } from '../models/product.model';


const API_BASE_URL = 'https://my-go-backend.onrender.com';

const FIND_ALL_PRODUCTS_URL = `${API_BASE_URL}/FindAllProducts`;
const FIND_PRODUCT_BY_ID_URL = `${API_BASE_URL}/FindProductByProductId`;
const CREATE_PRODUCT_URL = `${API_BASE_URL}/CreateProduct`;
const DELETE_PRODUCT_URL = `${API_BASE_URL}/DeleteProducts`;

export const ProductService = {
  async getProductById(productId: string): Promise<Product> {
    try {
      console.log('Fetching product by ID:', productId);
      const url = `${FIND_PRODUCT_BY_ID_URL}?productId=${encodeURIComponent(productId)}`;
      console.log('Request URL:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Raw API response:', data);
      
      // Transform the API response to match our Product interface
      const product: Product = {
        productId: data.productId || '',
        name: data.name || '',
        barcode: data.barcode || '',
        categoryId: data.categoryId || '',
        brandId: data.brandId || '',
        subCategoryId: data.subCategoryId || '',
        description: data.description || '',
        costPrice: Number(data.costPrice) || 0,
        sellingPrice: Number(data.sellingPrice) || 0,
        stockQty: Number(data.stockQty) || 0,
        expiry_date: data.expiry_date || '',
        created_at: data.created_at || '',
        updated_at: data.updated_at || '',
        deleted: data.deleted || false,
        productSubcategories: data.productSubcategories || []
      };
      
      console.log('Transformed product:', product);
      return product;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  },

  async getAllProducts(): Promise<Product[]> {
    try {
      console.log('Making API request:', FIND_ALL_PRODUCTS_URL);
      const response = await fetch(FIND_ALL_PRODUCTS_URL);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Raw API response:', data);
      
      // Transform the API response to match our Product interface
      const products: Product[] = data.map((item: any) => {
        return {
          productId: item.productId || '',
          name: item.name || '',
          barcode: item.barcode || '',
          categoryId: item.categoryId || '',
          brandId: item.brandId || '',
          subCategoryId: item.subCategoryId || '',
          description: item.description || '',
          costPrice: Number(item.costPrice) || 0,
          sellingPrice: Number(item.sellingPrice) || 0,
          stockQty: Number(item.stockQty) || 0,
          expiry_date: item.expiry_date || '',
          created_at: item.created_at || '',
          updated_at: item.updated_at || '',
          deleted: item.deleted || false,
          productSubcategories: item.productSubcategories || []
        };
      });
      
      console.log('Transformed products:', products);
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async createProduct(productData: ProductCreateRequest): Promise<Product> {
    try {
      // Format the request data to match backend expectations
      const requestData = {
        ...productData,
        subCategoryId: productData.subCategoryId,
        expiry_date: productData.productSubcategories?.[0]?.expiryDate
      };
      
      console.log('Creating product with data:', JSON.stringify(requestData, null, 2));
      
      // Generate a unique product ID if not provided
      if (!requestData.productId) {
        const timestamp = Date.now();
        const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        requestData.productId = `PRD-${timestamp}-${randomPart}`;
      }

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
        
        // Validate date format
        try {
          new Date(sub.expiryDate).toISOString();
        } catch (error) {
          throw new Error(`Subcategory ${index + 1}: Invalid date format. Must be ISO 8601 format`);
        }
      });

      // Add expiry_date from the first subcategory
      if (productData.productSubcategories?.[0]) {
        productData.expiry_date = productData.productSubcategories[0].expiryDate;
      }
      
      console.log('Request URL:', CREATE_PRODUCT_URL);
      console.log('Request payload:', JSON.stringify(requestData, null, 2));
      
      const response = await fetch(CREATE_PRODUCT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
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
      
      // Transform the response if needed
      const transformedProduct: Product = {
        ...data,
        expiry_date: data.expiry_date || '',  // Use the expiry_date directly from the backend response
        productSubcategories: data.productSubcategories || []
      };

      return transformedProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create product');
    }
  },

  async deleteProduct(productId: string): Promise<void> {
    try {
      console.log('Deleting product with ID:', productId);
      
      const url = `${DELETE_PRODUCT_URL}?productId=${encodeURIComponent(productId)}`;
      console.log('Delete request URL:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Delete response status:', response.status);
      
      if (!response.ok) {
        const responseText = await response.text();
        console.error('Delete error response:', responseText);
        
        let errorMessage = 'Failed to delete product';
        
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          errorMessage = responseText || 'Invalid server response';
        }
        
        throw new Error(errorMessage);
      }

      console.log('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete product');
    }
  }
};