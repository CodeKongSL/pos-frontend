import { GRN, GRNCreateRequest, GRNPaginationResponse, GRNPaginationParams } from '../models/grn.model';

const API_BASE_URL = 'https://my-go-backend.onrender.com';

const CREATE_GRN_URL = `${API_BASE_URL}/CreateGRN`;
const FIND_ALL_GRNS_URL = `${API_BASE_URL}/FindAllGRNs`;

export const GRNService = {
  async createGRN(grnData: GRNCreateRequest): Promise<GRN> {
    try {
      console.log('Creating GRN with data:', grnData);
      
      const response = await fetch(CREATE_GRN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(grnData)
      });

      console.log('GRN Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw GRN response:', responseText);

      if (!response.ok) {
        console.error('GRN Server error response:', responseText);
        
        let errorMessage = 'Failed to create GRN';
        
        try {
          const errorData = JSON.parse(responseText);
          
          if (errorData.error?.includes('duplicate') || errorData.error?.includes('unique')) {
            errorMessage = 'A GRN with this number already exists. Please use a different GRN number.';
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
      
      return data;
    } catch (error) {
      console.error('Error creating GRN:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create GRN');
    }
  },

  async getAllGRNs(params: GRNPaginationParams = { page: 1, per_page: 15 }): Promise<GRNPaginationResponse> {
    try {
      const queryParams = new URLSearchParams({
        page: (params.page || 1).toString(),
        per_page: (params.per_page || 15).toString()
      });
      
      const url = `${FIND_ALL_GRNS_URL}?${queryParams.toString()}`;
      console.log('Making API request to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('GRNs Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw GRNs response:', responseText);

      if (!response.ok) {
        console.error('GRNs Server error response:', responseText);
        throw new Error(`Failed to fetch GRNs: ${response.status}`);
      }

      // Parse the response
      const data = responseText ? JSON.parse(responseText) : { data: [], page: 1, per_page: 15, total: 0, total_pages: 0 };
      
      // Filter out deleted GRNs from the data array
      if (data.data && Array.isArray(data.data)) {
        data.data = data.data.filter((grn: GRN) => !grn.deleted);
      }
      
      return data as GRNPaginationResponse;
    } catch (error) {
      console.error('Error fetching GRNs:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch GRNs');
    }
  },

  // Legacy method for backward compatibility - returns only the GRNs array
  async getGRNsOnly(params: GRNPaginationParams = { page: 1, per_page: 15 }): Promise<GRN[]> {
    try {
      const response = await this.getAllGRNs(params);
      return response.data;
    } catch (error) {
      console.error('Error fetching GRNs:', error);
      throw error;
    }
  }
};