import { Product, ProductCreate, ProductCreateRequest, PaginatedProductResponse, ProductPaginationParams } from '../models/product.model';

// Get API base URL from environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://my-go-backend.onrender.com';

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

  async getAllProducts(params?: ProductPaginationParams): Promise<PaginatedProductResponse> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (params?.per_page) {
        queryParams.append('per_page', params.per_page.toString());
      } else {
        queryParams.append('per_page', '15'); // Default to 15
      }
      
      // Only add cursor if it's provided and not null/empty
      if (params?.cursor && params.cursor.trim() !== '') {
        queryParams.append('cursor', params.cursor);
      }
      
      const url = `${FIND_ALL_PRODUCTS_URL}?${queryParams.toString()}`;
      console.log('🌐 Making API request to:', url);
      console.log('🔧 Environment API URL:', import.meta.env.VITE_API_URL);
      console.log('🔧 Using API_BASE_URL:', API_BASE_URL);
      
      const response = await fetch(url);
      console.log('📡 Response status:', response.status);
      console.log('📋 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extensive debugging for production
      console.log('🔍 === DEBUGGING API RESPONSE ===');
      console.log('Raw data type:', typeof data);
      console.log('Raw data is null?:', data === null);
      console.log('Raw data is undefined?:', data === undefined);
      console.log('Raw data toString:', String(data));
      
      if (data && typeof data === 'object') {
        console.log('✅ Data is object');
        console.log('Object keys:', Object.keys(data));
        console.log('Has data property?:', 'data' in data);
        console.log('data property type:', typeof data.data);
        console.log('data property value:', data.data);
        console.log('Is data.data array?:', Array.isArray(data.data));
        
        if (data.data !== null && data.data !== undefined) {
          console.log('data.data is not null/undefined');
          console.log('data.data constructor:', data.data.constructor?.name);
          if (Array.isArray(data.data)) {
            console.log('✅ data.data is confirmed array with length:', data.data.length);
          } else {
            console.log('❌ data.data is NOT an array:', data.data);
          }
        } else {
          console.log('❌ data.data is null or undefined');
        }
      } else {
        console.log('❌ Data is not an object or is null/undefined');
      }
      console.log('🔍 === END DEBUGGING ===');
      console.log('Raw API response:', data);
      console.log('Type of data:', typeof data);
      console.log('Is data an object?', data && typeof data === 'object');
      console.log('Data keys:', data ? Object.keys(data) : 'No data');
      console.log('Type of data.data:', typeof data?.data);
      console.log('Is data.data an array?', Array.isArray(data?.data));
      console.log('data.data value:', data?.data);
      
      // Initialize with empty array - NEVER call .map() on anything uncertain
      let transformedProducts: Product[] = [];
      
      // Ultra-defensive approach - check every possible scenario
      try {
        if (!data) {
          console.warn('⚠️ No data received from API');
          transformedProducts = [];
        } else if (typeof data !== 'object') {
          console.warn('⚠️ API response is not an object:', typeof data, data);
          transformedProducts = [];
        } else {
          // Look for products in various possible response structures
          let rawProductsArray: any = null;
          
          // Check data.data first (most likely structure)
          if (data.hasOwnProperty('data')) {
            console.log('✅ Found data.data property');
            if (Array.isArray(data.data)) {
              console.log('✅ data.data is confirmed array with length:', data.data.length);
              rawProductsArray = data.data;
            } else if (data.data === null || data.data === undefined) {
              console.log('ℹ️ data.data is null/undefined - no products');
              rawProductsArray = [];
            } else {
              console.warn('⚠️ data.data exists but is not an array:', typeof data.data);
              console.warn('⚠️ data.data value:', data.data);
              rawProductsArray = [];
            }
          }
          // Check if response itself is an array
          else if (Array.isArray(data)) {
            console.log('✅ Response itself is an array');
            rawProductsArray = data;
          }
          // Check for products property
          else if (data.hasOwnProperty('products') && Array.isArray(data.products)) {
            console.log('✅ Found data.products array');
            rawProductsArray = data.products;
          }
          // Check for items property (another common pattern)
          else if (data.hasOwnProperty('items') && Array.isArray(data.items)) {
            console.log('✅ Found data.items array');
            rawProductsArray = data.items;
          }
          else {
            console.warn('⚠️ No recognizable products array found in response structure');
            console.warn('Available properties:', Object.keys(data));
            rawProductsArray = [];
          }
          
          // CRITICAL: Double and triple check before ANY array operations
          if (rawProductsArray === null || rawProductsArray === undefined) {
            console.warn('⚠️ rawProductsArray is null/undefined');
            transformedProducts = [];
          } else if (!Array.isArray(rawProductsArray)) {
            console.error('❌ CRITICAL: rawProductsArray is not an array!');
            console.error('Type:', typeof rawProductsArray);
            console.error('Value:', rawProductsArray);
            console.error('Constructor:', rawProductsArray.constructor?.name);
            transformedProducts = [];
          } else {
            console.log('✅ Processing', rawProductsArray.length, 'products safely');
            
            // Use traditional for loop - absolutely no array methods until we're 100% sure
            const processedProducts: Product[] = [];
            const arrayLength = rawProductsArray.length;
            
            for (let i = 0; i < arrayLength; i++) {
              try {
                const item = rawProductsArray[i];
                
                if (item && typeof item === 'object') {
                  const transformedProduct: Product = {
                    productId: String(item.productId || ''),
                    name: String(item.name || ''),
                    barcode: String(item.barcode || ''),
                    categoryId: String(item.categoryId || ''),
                    brandId: String(item.brandId || ''),
                    subCategoryId: String(item.subCategoryId || ''),
                    description: String(item.description || ''),
                    costPrice: Number(item.costPrice) || 0,
                    sellingPrice: Number(item.sellingPrice) || 0,
                    stockQty: Number(item.stockQty) || 0,
                    expiry_date: String(item.expiry_date || ''),
                    created_at: String(item.created_at || ''),
                    updated_at: String(item.updated_at || ''),
                    deleted: Boolean(item.deleted),
                    productSubcategories: Array.isArray(item.productSubcategories) ? item.productSubcategories : []
                  };
                  processedProducts.push(transformedProduct);
                } else {
                  console.warn('⚠️ Invalid product item at index', i, ':', item);
                }
              } catch (itemError) {
                console.warn('⚠️ Failed to process product at index', i, ':', itemError);
                // Continue processing other items
              }
            }
            
            transformedProducts = processedProducts;
            console.log('✅ Successfully processed', transformedProducts.length, 'products');
          }
        }
      } catch (processingError) {
        console.error('❌ Error during product processing:', processingError);
        transformedProducts = [];
      }
      
      const paginatedResponse: PaginatedProductResponse = {
        data: transformedProducts,
        per_page: (data && typeof data === 'object' && typeof data.per_page === 'number') ? data.per_page : (params?.per_page || 15),
        next_cursor: (data && typeof data === 'object' && data.next_cursor !== undefined) ? data.next_cursor : null,
        has_more: (data && typeof data === 'object') ? Boolean(data.has_more) : false
      };
      
      console.log('Final paginated response:', paginatedResponse);
      console.log('Final products count:', transformedProducts.length);
      return paginatedResponse;
    } catch (error) {
      console.error('Error fetching products:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Full error object:', error);
      
      // Return empty response instead of throwing to prevent app crash
      const fallbackResponse: PaginatedProductResponse = {
        data: [],
        per_page: params?.per_page || 15,
        next_cursor: null,
        has_more: false
      };
      
      // Still throw the error so the UI can handle it properly
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch products');
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