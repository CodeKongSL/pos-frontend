import { Brand, BrandCreate, BrandCreateRequest } from '../models/brand.model';

const API_BASE_URL = 'https://my-go-backend.onrender.com';

const FIND_ALL_BRANDS_URL = `${API_BASE_URL}/FindAllBrands`;
const CREATE_BRAND_URL = `${API_BASE_URL}/CreateBrands`;

export const BrandService = {
  async getAllBrands(): Promise<Brand[]> {
    try {
      console.log('Making API request to:', FIND_ALL_BRANDS_URL);
      const response = await fetch(FIND_ALL_BRANDS_URL);
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      const data = await response.json();
      console.log('Raw API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  },

  async createBrand(brandData: BrandCreateRequest): Promise<Brand> {
    try {
      console.log('Creating brand with data:', brandData);
      
      // Validate that brandName is present and not empty
      if (!brandData.brandName) {
        throw new Error('Brand name is required');
      }
      
      // Construct URL with query parameter
      const url = `${CREATE_BRAND_URL}?brandName=${encodeURIComponent(brandData.brandName)}`;
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
        throw new Error(responseText || 'Failed to create brand');
      }

      // Try to parse the response as JSON if it's not empty
      const data = responseText ? JSON.parse(responseText) : {};

      return data as Brand;
    } catch (error) {
      console.error('Error creating brand:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create brand');
    }
  }
};