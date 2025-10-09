import { Category, CategoryCreate, CategoryCreateRequest, CategoryPaginationResponse, CategoryPaginationParams } from '../models/category.model';

// Base URLs for different endpoints
const API_BASE_URL = 'https://my-go-backend.onrender.com';

const FIND_ALL_CATEGORY_URL = `${API_BASE_URL}/FindAllCategory`;
const CREATE_CATEGORY_URL = `${API_BASE_URL}/CreateCategory`;
const DELETE_CATEGORY_URL = `${API_BASE_URL}/DeleteCategory`;
const FIND_ALL_DELETED_PRODUCTS_URL = `${API_BASE_URL}/FindAllDeletedProducts`;
const RESTORE_PRODUCT_URL = `${API_BASE_URL}/RestoreProduct`;

interface RestoreProductParams {
  productId: string;
  categoryId: string;
  brandId: string;
  subCategoryId: string;
}

export const CategoryService = {
  async getAllCategories(params: CategoryPaginationParams = { page: 1, per_page: 15 }): Promise<CategoryPaginationResponse> {
    try {
      const queryParams = new URLSearchParams({
        page: (params.page || 1).toString(),
        per_page: (params.per_page || 15).toString()
      });
      
      const url = `${FIND_ALL_CATEGORY_URL}?${queryParams.toString()}`;
      console.log('Making API request to:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      console.log('Raw API response:', data);
      
      return data as CategoryPaginationResponse;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Legacy method for backward compatibility - returns only the categories array
  async getCategoriesOnly(params: CategoryPaginationParams = { page: 1, per_page: 15 }): Promise<Category[]> {
    try {
      const response = await this.getAllCategories(params);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async createCategory(categoryData: CategoryCreateRequest): Promise<Category> {
    try {
      console.log('Creating category with data:', categoryData);
      
      // Validate that categoryName is present and not empty
      if (!categoryData.categoryName) {
        throw new Error('Category name is required');
      }
      
      // Construct URL with query parameter
      const url = `${CREATE_CATEGORY_URL}?categoryName=${encodeURIComponent(categoryData.categoryName)}`;
      console.log('Request URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        console.error('Server error response:', responseText);
        throw new Error(responseText || 'Failed to create category');
      }

      // Try to parse the response as JSON if it's not empty
      const data = responseText ? JSON.parse(responseText) : {};

      return data as Category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create category');
    }
  },

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      const url = `${DELETE_CATEGORY_URL}?categoryId=${encodeURIComponent(categoryId)}`;
      console.log('Deleting category:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete category');
    }
  },

  async getAllDeletedProducts(): Promise<any[]> {
    try {
      console.log('Making API request to:', FIND_ALL_DELETED_PRODUCTS_URL);
      const response = await fetch(FIND_ALL_DELETED_PRODUCTS_URL);
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to fetch deleted products');
      }
      const data = await response.json();
      console.log('Raw API response:', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching deleted products:', error);
      throw error;
    }
  },

  async restoreProduct(params: RestoreProductParams): Promise<void> {
    try {
      // Construct URL with query parameters
      const url = `${RESTORE_PRODUCT_URL}?productId=${encodeURIComponent(params.productId)}&categoryId=${encodeURIComponent(params.categoryId)}&brandId=${encodeURIComponent(params.brandId)}&subCategoryId=${encodeURIComponent(params.subCategoryId)}`;
      console.log('Restoring product:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(errorText || 'Failed to restore product');
      }

      const responseText = await response.text();
      console.log('Restore response:', responseText);
    } catch (error) {
      console.error('Error restoring product:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to restore product');
    }
  }
};