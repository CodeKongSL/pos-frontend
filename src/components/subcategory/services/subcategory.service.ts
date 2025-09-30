import { Subcategory, SubcategoryCreate, SubcategoryCreateRequest } from '../models/subcategory.model';

const API_BASE_URL = 'https://my-go-backend.onrender.com';

const FIND_ALL_SUBCATEGORY_URL = `${API_BASE_URL}/FindAllSubCategory`;
const CREATE_SUBCATEGORY_URL = `${API_BASE_URL}/CreateSubCategory`;

export const SubcategoryService = {
  async getAllSubcategories(): Promise<Subcategory[]> {
    try {
      console.log('Making API request to:', FIND_ALL_SUBCATEGORY_URL);
      const response = await fetch(FIND_ALL_SUBCATEGORY_URL);
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to fetch subcategories');
      }
      const data = await response.json();
      console.log('Raw API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  },

  async createSubcategory(subcategoryData: SubcategoryCreateRequest): Promise<Subcategory> {
    try {
      console.log('Creating subcategory with data:', subcategoryData);
      
      // Validate that required fields are present
      if (!subcategoryData.subcategoryName) {
        throw new Error('Subcategory name is required');
      }
      if (!subcategoryData.brandId) {
        throw new Error('Brand ID is required');
      }
      
      // Construct URL with query parameters
      const url = `${CREATE_SUBCATEGORY_URL}?subcategoryName=${encodeURIComponent(subcategoryData.subcategoryName)}&brandId=${encodeURIComponent(subcategoryData.brandId)}`;
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
        throw new Error(responseText || 'Failed to create subcategory');
      }

      // Try to parse the response as JSON if it's not empty
      const data = responseText ? JSON.parse(responseText) : {};

      return data as Subcategory;
    } catch (error) {
      console.error('Error creating subcategory:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create subcategory');
    }
  }
};