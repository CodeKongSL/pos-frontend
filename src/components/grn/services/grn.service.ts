import { GRN, GRNCreateRequest, GRNPaginationResponse, GRNPaginationParams } from '../models/grn.model';

const API_BASE_URL = 'https://my-go-backend.onrender.com';

const CREATE_GRN_URL = `${API_BASE_URL}/CreateGRN`;
const FIND_ALL_GRNS_URL = `${API_BASE_URL}/FindAllGRNs`;
const UPDATE_GRN_STATUS_URL = `${API_BASE_URL}/UpdateGRNStatus`;
const GET_TOTAL_GRNS_COUNT_URL = `${API_BASE_URL}/GetTotalGRNsCount`;
const GET_COMPLETED_GRNS_COUNT_URL = `${API_BASE_URL}/GetCompletedGRNsCount`;
const GET_PENDING_GRNS_COUNT_URL = `${API_BASE_URL}/GetPendingGRNsCount`;

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
  },

  async updateGRNStatus(grnId: string, status: 'pending' | 'completed' | 'partial_received'): Promise<GRN> {
    try {
      console.log('Updating GRN status:', { grnId, status });
      
      const response = await fetch(UPDATE_GRN_STATUS_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          grnId: grnId,
          status: status
        })
      });

      console.log('Update GRN Status Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw Update GRN Status response:', responseText);

      if (!response.ok) {
        console.error('Update GRN Status Server error response:', responseText);
        
        let errorMessage = 'Failed to update GRN status';
        
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.error) {
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
      console.error('Error updating GRN status:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update GRN status');
    }
  },

  async getTotalGRNsCount(): Promise<number> {
    try {
      console.log('Fetching total GRNs count...');
      
      const response = await fetch(GET_TOTAL_GRNS_COUNT_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Total GRNs Count Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw Total GRNs Count response:', responseText);

      if (!response.ok) {
        console.error('Total GRNs Count Server error response:', responseText);
        throw new Error(`Failed to fetch total GRNs count: ${response.status}`);
      }

      // Parse the response
      const data = responseText ? JSON.parse(responseText) : { total_grns: 0 };
      
      // Return the total_grns count or 0 if not found
      return data.total_grns || 0;
    } catch (error) {
      console.error('Error fetching total GRNs count:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch total GRNs count');
    }
  },

  async getCompletedGRNsCount(): Promise<number> {
    try {
      console.log('Fetching completed GRNs count...');
      
      const response = await fetch(GET_COMPLETED_GRNS_COUNT_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Completed GRNs Count Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw Completed GRNs Count response:', responseText);

      if (!response.ok) {
        console.error('Completed GRNs Count Server error response:', responseText);
        throw new Error(`Failed to fetch completed GRNs count: ${response.status}`);
      }

      // Parse the response
      const data = responseText ? JSON.parse(responseText) : { completed_grns: 0 };
      
      // Return the completed_grns count or 0 if not found
      return data.completed_grns || 0;
    } catch (error) {
      console.error('Error fetching completed GRNs count:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch completed GRNs count');
    }
  },

  async getPendingGRNsCount(): Promise<number> {
    try {
      console.log('Fetching pending GRNs count...');
      
      const response = await fetch(GET_PENDING_GRNS_COUNT_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Pending GRNs Count Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw Pending GRNs Count response:', responseText);

      if (!response.ok) {
        console.error('Pending GRNs Count Server error response:', responseText);
        throw new Error(`Failed to fetch pending GRNs count: ${response.status}`);
      }

      // Parse the response
      const data = responseText ? JSON.parse(responseText) : { pending_grns: 0 };
      
      // Return the pending_grns count or 0 if not found
      return data.pending_grns || 0;
    } catch (error) {
      console.error('Error fetching pending GRNs count:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch pending GRNs count');
    }
  }
};