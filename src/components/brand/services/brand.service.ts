import { Brand, BrandCreate, BrandCreateRequest, Product, ProductsByBrandResponse, BrandPaginationResponse, BrandPaginationParams } from '../models/brand.model';

const API_BASE_URL = 'https://my-go-backend.onrender.com';

const FIND_ALL_BRANDS_URL = `${API_BASE_URL}/FindAllBrands`;
const CREATE_BRAND_URL = `${API_BASE_URL}/CreateBrands`;
const DELETE_BRAND_URL = `${API_BASE_URL}/DeleteBrand`;
const FIND_PRODUCTS_BY_BRAND_URL = `${API_BASE_URL}/FindProductsByBrandId`;

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

  async getProductsByBrandIdWithPagination(brandId: string, perPage: number = 15): Promise<ProductsByBrandResponse> {
    try {
      console.log('Fetching products for brand ID:', brandId, 'with per_page:', perPage);
      
      if (!brandId) {
        throw new Error('Brand ID is required');
      }
      
      const url = `${FIND_PRODUCTS_BY_BRAND_URL}?brandId=${brandId}&per_page=${perPage}`;
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
          per_page: data.per_page || perPage,
          next_cursor: data.next_cursor || null,
          has_more: data.has_more || false
        };
      }
      
      // Fallback for old format (if data is directly an array)
      const products = Array.isArray(data) ? data : [];
      const filteredProducts = products.filter((product: Product) => !product.deleted);
      
      return {
        data: filteredProducts,
        per_page: perPage,
        next_cursor: null,
        has_more: false
      };
    } catch (error) {
      console.error('Error fetching products by brand:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch products');
    }
  }
};