import { Category, CategoryCreate, CategoryCreateRequest } from '../models/category.model';

// Base URLs for different endpoints
const API_BASE_URL = import.meta.env.PROD 
  ? `${import.meta.env.VITE_API_URL || ''}/api`  // In production, use the full URL if specified
  : '/api';  // In development, use the proxy

const CREATE_CATEGORY_URL = import.meta.env.PROD
  ? `${import.meta.env.VITE_API_URL || ''}/CreateCategory`  // In production
  : '/CreateCategory';  // In development

export const CategoryService = {
  async getAllCategories(): Promise<Category[]> {
    try {
      console.log('Making API request to:', `${API_BASE_URL}/categories`);
      const response = await fetch(`${API_BASE_URL}/categories`);
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
      console.log('Creating category - URL:', CREATE_CATEGORY_URL);
      console.log('Request payload:', categoryData);
      
      // Validate that categoryName is present and not empty
      if (!categoryData.categoryName) {
        throw new Error('Category name is required');
      }
      
      const bodyContent = JSON.stringify(categoryData);
      
      console.log('Request body:', bodyContent);
      
      const url = new URL(CREATE_CATEGORY_URL, window.location.origin);
      url.searchParams.append('categoryName', categoryData.categoryName);
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });

      // Log the response for debugging
      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        console.error('Server error response:', responseText);
        throw new Error(responseText || 'Failed to create category');
      }

      // Try to parse the response as JSON if it's not empty
      const data = responseText ? JSON.parse(responseText) : {};

      // Return the parsed data or a constructed Category object
      return data as Category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create category');
    }
  }
};