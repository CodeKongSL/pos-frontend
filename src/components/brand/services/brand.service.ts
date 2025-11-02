import { Brand, BrandCreate, BrandCreateRequest, Product, ProductsByBrandResponse, BrandPaginationResponse, BrandPaginationParams, BrandCostSummary, TotalCostSummary, ProductCountResponse, BrandSearchParams, BrandSearchResponse } from '../models/brand.model';

const API_BASE_URL = 'https://my-go-backend.onrender.com';

const FIND_ALL_BRANDS_URL = `${API_BASE_URL}/FindAllBrands`;
const CREATE_BRAND_URL = `${API_BASE_URL}/CreateBrands`;
const DELETE_BRAND_URL = `${API_BASE_URL}/DeleteBrand`;
const FIND_PRODUCTS_BY_BRAND_URL = `${API_BASE_URL}/FindProductsByBrandId`;
const FIND_BRANDS_BY_CATEGORY_URL = `${API_BASE_URL}/FindBrandsByCategory`;
const CALCULATE_BRAND_COST_SUMMARY_URL = `${API_BASE_URL}/CalculateBrandCostSummary`;
const CALCULATE_TOTAL_COST_URL = `${API_BASE_URL}/CalculateTotalCost`;
const BRAND_PRODUCTS_COUNT_URL = `${API_BASE_URL}/api/brands`;
const BRAND_SEARCH_URL = `${API_BASE_URL}/api/brands/search`;

export const BrandService = {
  async getAllBrands(params: BrandPaginationParams = { page: 1, per_page: 15 }): Promise<BrandPaginationResponse> {
    try {
      const queryParams = new URLSearchParams({
        page: (params.page || 1).toString(),
        per_page: (params.per_page || 15).toString()
      });
      
      const url = `${FIND_ALL_BRANDS_URL}?${queryParams.toString()}`;
      console.log('Making API request to:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      
      const data = await response.json();
      console.log('Raw API response:', data);
      
      return data as BrandPaginationResponse;
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  },

  // Legacy method for backward compatibility - returns only the brands array
  async getBrandsOnly(params: BrandPaginationParams = { page: 1, per_page: 15 }): Promise<Brand[]> {
    try {
      const response = await this.getAllBrands(params);
      return response.data;
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  },

  // DEPRECATED: Use searchBrands() instead for better performance with large datasets
  // This method kept for backward compatibility only
  async getAllBrandsForDropdown(): Promise<Brand[]> {
    try {
      let allBrands: Brand[] = [];
      let currentPage = 1;
      let hasMorePages = true;
      const MAX_PAGES = 20; // Safety limit to prevent excessive API calls

      // Keep fetching pages until we have all brands
      while (hasMorePages && currentPage <= MAX_PAGES) {
        console.log(`Fetching brands page ${currentPage}...`);
        const response = await this.getAllBrands({ page: currentPage, per_page: 50 }); // Use maximum allowed page size
        
        // Add brands from this page to our collection
        allBrands = [...allBrands, ...response.data];
        
        // Check if there are more pages
        hasMorePages = currentPage < response.total_pages;
        currentPage++;
        
        console.log(`Page ${currentPage - 1}: Got ${response.data.length} brands. Total so far: ${allBrands.length}/${response.total}`);
      }

      if (hasMorePages) {
        console.warn(`Stopped fetching brands at page ${MAX_PAGES}. Total brands may exceed ${allBrands.length}.`);
      }

      // Filter out deleted brands
      const activeBrands = allBrands.filter(brand => !brand.deleted);
      console.log(`Fetched ${allBrands.length} total brands, ${activeBrands.length} active brands for dropdown`);
      return activeBrands;
    } catch (error) {
      console.error('Error fetching all brands for dropdown:', error);
      throw error;
    }
  },

  // Method to fetch brands by category ID using client-side filtering (since API endpoint doesn't exist)
  async getBrandsByCategory(categoryId: string): Promise<Brand[]> {
    try {
      console.log('Fetching brands for category:', categoryId);
      
      if (!categoryId) {
        console.log('No category ID provided, returning empty array');
        return [];
      }
      
      // Skip API call and use client-side filtering since endpoint doesn't exist
      console.log('Using client-side filtering for brands by category');
      const allBrands = await this.getAllBrandsForDropdown();
      const filteredBrands = allBrands.filter(brand => brand.categoryId === categoryId);
      
      console.log(`Filtered ${filteredBrands.length} brands for category ${categoryId} from ${allBrands.length} total brands`);
      return filteredBrands;
      
    } catch (error) {
      console.error('Error fetching brands by category:', error);
      throw new Error('Failed to fetch brands for category');
    }
  },

  async createBrand(brandData: BrandCreateRequest): Promise<Brand> {
    try {
      console.log('Creating brand with data:', brandData);
      
      // Validate that required fields are present and not empty
      if (!brandData.name) {
        throw new Error('Brand name is required');
      }
      if (!brandData.categoryId) {
        throw new Error('Category ID is required');
      }
      
      // Send data in request body as JSON
      const url = CREATE_BRAND_URL;
      console.log('Request URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(brandData)
      });

      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        console.error('Server error response:', responseText);
        throw new Error(responseText || 'Failed to create brand');
      }

      // Try to parse the response as JSON if it's not empty
      const data = responseText ? JSON.parse(responseText) : {};

      return data as Brand;
    } catch (error) {
      console.error('Error creating brand:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create brand');
    }
  },

  async deleteBrand(brandId: string): Promise<void> {
    try {
      console.log('Deleting brand with ID:', brandId);
      
      if (!brandId) {
        throw new Error('Brand ID is required');
      }
      
      const url = `${DELETE_BRAND_URL}?brandId=${brandId}`;
      console.log('Request URL:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const responseText = await response.text();
        console.error('Server error response:', responseText);
        throw new Error(responseText || 'Failed to delete brand');
      }

      console.log('Brand deleted successfully');
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete brand');
    }
  },

  async getProductsByBrandId(brandId: string, perPage: number = 15): Promise<Product[]> {
    try {
      const response = await this.getProductsByBrandIdWithPagination(brandId, perPage);
      return response.data;
    } catch (error) {
      console.error('Error fetching products by brand:', error);
      throw error;
    }
  },

  async getProductsByBrandIdWithPagination(brandId: string, perPage: number = 15, cursor?: string): Promise<ProductsByBrandResponse> {
    try {
      console.log('Fetching products for brand ID:', brandId, 'with per_page:', perPage, 'cursor:', cursor);
      
      if (!brandId) {
        throw new Error('Brand ID is required');
      }
      
      // Validate per_page parameter against backend limits
      const validatedPerPage = [15, 25, 50].includes(perPage) ? perPage : 15;
      if (validatedPerPage !== perPage) {
        console.warn(`Invalid per_page value ${perPage}, using ${validatedPerPage} instead`);
      }
      
      const queryParams = new URLSearchParams();
      queryParams.append('brandId', brandId);
      queryParams.append('per_page', validatedPerPage.toString());
      
      if (cursor && cursor.trim() !== '') {
        queryParams.append('cursor', cursor);
      }
      
      const url = `${FIND_PRODUCTS_BY_BRAND_URL}?${queryParams.toString()}`;
      console.log('Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to fetch products for brand');
      }

      const data = await response.json();
      console.log('Products response:', data);
      
      // Handle the new paginated response format
      if (data && typeof data === 'object') {
        const products = data.data || [];
        const filteredProducts = Array.isArray(products) ? products.filter((product: Product) => !product.deleted) : [];
        
        return {
          data: filteredProducts,
          per_page: data.per_page || validatedPerPage,
          next_cursor: data.next_cursor || null,
          has_more: data.has_more || false
        };
      }
      
      // Fallback for old format (if data is directly an array)
      const products = Array.isArray(data) ? data : [];
      const filteredProducts = products.filter((product: Product) => !product.deleted);
      
      return {
        data: filteredProducts,
        per_page: validatedPerPage,
        next_cursor: null,
        has_more: false
      };
    } catch (error) {
      console.error('Error fetching products by brand:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch products');
    }
  },

  // Method to get total count of all branded products (products with valid brandId)
  // NOTE: This method is for the overall statistics only. Individual brand product counts
  // should be fetched on-demand using getProductsByBrandId() for better performance
  async getTotalBrandedProductsCount(): Promise<number> {
    try {
      console.log('Fetching total branded products count...');
      
      let totalBrandedProducts = 0;
      let hasMore = true;
      let cursor: string | null = null;

      // Fetch all products using pagination and count those with brandId
      while (hasMore) {
        // Make direct API call to avoid circular dependency with ProductService
        const API_BASE_URL = 'https://my-go-backend.onrender.com';
        const FIND_ALL_PRODUCTS_URL = `${API_BASE_URL}/FindAllProducts`;
        
        const queryParams = new URLSearchParams();
        queryParams.append('per_page', '100'); // Use larger page size for efficiency
        
        if (cursor && cursor.trim() !== '') {
          queryParams.append('cursor', cursor);
        }
        
        const url = `${FIND_ALL_PRODUCTS_URL}?${queryParams.toString()}`;
        console.log('Fetching products for count:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products for counting');
        }
        
        const data = await response.json();
        
        // Handle response data safely
        let products: any[] = [];
        if (data && typeof data === 'object' && Array.isArray(data.data)) {
          products = data.data;
        } else if (Array.isArray(data)) {
          products = data;
        }
        
        // Count products that have a brandId and are not deleted
        const brandedProductsInPage = products.filter(product => 
          product &&
          !product.deleted && 
          product.brandId && 
          product.brandId.trim() !== ''
        ).length;
        
        totalBrandedProducts += brandedProductsInPage;
        hasMore = data.has_more || false;
        cursor = data.next_cursor || null;
        
        console.log(`Page processed: Found ${brandedProductsInPage} branded products. Total so far: ${totalBrandedProducts}`);
      }
      
      console.log(`Total branded products count: ${totalBrandedProducts}`);
      return totalBrandedProducts;
    } catch (error) {
      console.error('Error fetching total branded products count:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch branded products count');
    }
  },

  async getBrandCostSummary(brandId: string): Promise<BrandCostSummary> {
    try {
      console.log('Fetching cost summary for brand ID:', brandId);
      
      if (!brandId) {
        throw new Error('Brand ID is required');
      }
      
      const url = `${CALCULATE_BRAND_COST_SUMMARY_URL}?brandId=${brandId}`;
      console.log('Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const responseText = await response.text();
        console.error('Server error response:', responseText);
        throw new Error(responseText || 'Failed to fetch brand cost summary');
      }

      const data = await response.json();
      console.log('Brand cost summary response:', data);
      
      return data as BrandCostSummary;
    } catch (error) {
      console.error('Error fetching brand cost summary:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch brand cost summary');
    }
  },

  async getTotalCostSummary(): Promise<TotalCostSummary> {
    try {
      console.log('Fetching total cost summary...');
      
      const url = CALCULATE_TOTAL_COST_URL;
      console.log('Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const responseText = await response.text();
        console.error('Server error response:', responseText);
        throw new Error(responseText || 'Failed to fetch total cost summary');
      }

      const data = await response.json();
      console.log('Total cost summary response:', data);
      
      return data as TotalCostSummary;
    } catch (error) {
      console.error('Error fetching total cost summary:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch total cost summary');
    }
  },

  // NEW OPTIMIZED ENDPOINTS

  /**
   * Get product count for a specific brand
   * Uses new backend endpoint for efficient counting
   */
  async getProductCountByBrand(brandId: string): Promise<number> {
    try {
      if (!brandId) {
        throw new Error('Brand ID is required');
      }

      const url = `${BRAND_PRODUCTS_COUNT_URL}/${encodeURIComponent(brandId)}/products/count`;
      console.log('Fetching product count for brand:', brandId);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch brand product count');
      }

      const data: ProductCountResponse = await response.json();
      console.log(`Brand ${brandId} has ${data.count} products`);
      return data.count;
    } catch (error) {
      console.error('Error fetching brand product count:', error);
      throw error;
    }
  },

  /**
   * Search brands by name (for autocomplete/search functionality)
   * Much more efficient than fetching all brands for dropdowns
   */
  async searchBrands(params: BrandSearchParams): Promise<Brand[]> {
    try {
      const queryParams = new URLSearchParams({
        q: params.q,
        ...(params.limit && { limit: params.limit.toString() })
      });

      const url = `${BRAND_SEARCH_URL}?${queryParams.toString()}`;
      console.log('Searching brands:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search brands');
      }

      const data: BrandSearchResponse = await response.json();
      console.log(`Found ${data.data.length} brands matching "${params.q}"`);
      return data.data;
    } catch (error) {
      console.error('Error searching brands:', error);
      throw error;
    }
  }
};