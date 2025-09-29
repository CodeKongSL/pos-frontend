import { Category, CategoryCreate, CategoryCreateRequest } from '../models/category.model';

// Base URLs for different endpoints
const API_BASE_URL = 'https://my-go-backend.onrender.com';

const FIND_ALL_CATEGORY_URL = `${API_BASE_URL}/FindAllCategory`;
const CREATE_CATEGORY_URL = `${API_BASE_URL}/CreateCategory`;

export const CategoryService = {
  async getAllCategories(): Promise<Category[]> {
    try {
      console.log('Making API request to:', FIND_ALL_CATEGORY_URL);
      const response = await fetch(FIND_ALL_CATEGORY_URL);
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      console.log('Raw API response:', data);
      return data;
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
  }
};