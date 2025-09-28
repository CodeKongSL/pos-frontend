import { Category, CategoryCreate } from '../models/category.model';

// Base URL that can be easily changed when moving to production
const API_BASE_URL = import.meta.env.PROD 
  ? `${import.meta.env.VITE_API_URL || ''}/api`  // In production, use the full URL if specified
  : '/api';  // In development, use the proxy

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

  async createCategory(categoryData: CategoryCreate): Promise<Category> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }
};