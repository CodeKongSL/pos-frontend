import { Stock, PaginatedStockResponse, StockPaginationParams, CachedStockMetrics } from '../models/stock.model';

// Get API base URL from environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://my-go-backend.onrender.com';

const FIND_ALL_PRODUCTS_WITH_STOCK_LITE_URL = `${API_BASE_URL}/FindAllProductsWithStockLite`; // NEW - shows all products (with and without batches)
const FIND_ALL_STOCKS_LITE_URL = `${API_BASE_URL}/FindAllStocksLite`;
const FIND_ALL_STOCKS_FILTERED_URL = `${API_BASE_URL}/FindAllStocksFiltered`;
const GET_TOTAL_STOCK_QUANTITY_URL = `${API_BASE_URL}/GetTotalStockQuantity`;
const GET_STOCK_STATUS_COUNTS_URL = `${API_BASE_URL}/GetStockStatusCounts`;
const ADD_STOCK_URL = `${API_BASE_URL}/AddStock`;

const CACHE_KEY = 'stock_metrics_cache';
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes

export const StockService = {
  /**
   * Fetch stocks with lite pagination (shows ALL products - with and without batches)
   */
  async getAllStocksLite(params?: StockPaginationParams): Promise<PaginatedStockResponse> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (params?.per_page) {
        queryParams.append('per_page', params.per_page.toString());
      } else {
        queryParams.append('per_page', '15'); // Default to 15
      }
      
      // Only add cursor if it's provided and not null/empty
      if (params?.cursor && params.cursor.trim() !== '') {
        queryParams.append('cursor', params.cursor);
      }
      
      const url = `${FIND_ALL_PRODUCTS_WITH_STOCK_LITE_URL}?${queryParams.toString()}`;
      console.log('🌐 Making API request to:', url);
      console.log('🔧 Environment API URL:', import.meta.env.VITE_API_URL);
      console.log('🔧 Using API_BASE_URL:', API_BASE_URL);
      
      const response = await fetch(url);
      console.log('📡 Response status:', response.status);
      console.log('📋 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Failed to fetch stocks: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Raw API response:', data);
      
      // Validate response structure
      if (!data || !Array.isArray(data.data)) {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response structure');
      }
      
      const paginatedResponse: PaginatedStockResponse = {
        data: data.data || [],
        next_cursor: data.next_cursor || null,
        has_more: data.has_more || false
      };
      
      console.log('Final paginated response:', paginatedResponse);
      console.log('Final stocks count:', paginatedResponse.data.length);
      return paginatedResponse;
    } catch (error) {
      console.error('Error fetching stocks (lite):', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch stocks');
    }
  },

  /**
   * Fetch filtered stocks by status with pagination
   */
  async getFilteredStocks(status: 'low' | 'average', params?: StockPaginationParams): Promise<PaginatedStockResponse> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Add status filter
      queryParams.append('status', status);
      
      if (params?.per_page) {
        queryParams.append('per_page', params.per_page.toString());
      } else {
        queryParams.append('per_page', '15'); // Default to 15
      }
      
      // Only add cursor if it's provided and not null/empty
      if (params?.cursor && params.cursor.trim() !== '') {
        queryParams.append('cursor', params.cursor);
      }
      
      const url = `${FIND_ALL_STOCKS_FILTERED_URL}?${queryParams.toString()}`;
      console.log('🌐 Making filtered API request to:', url);
      
      const response = await fetch(url);
      console.log('📡 Response status:', response.status);
      console.log('📋 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Failed to fetch filtered stocks: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Raw filtered API response:', data);
      
      // Validate response structure
      if (!data || !Array.isArray(data.data)) {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response structure');
      }
      
      const paginatedResponse: PaginatedStockResponse = {
        data: data.data || [],
        next_cursor: data.next_cursor || null,
        has_more: data.has_more || false
      };
      
      console.log('Final filtered paginated response:', paginatedResponse);
      console.log('Final filtered stocks count:', paginatedResponse.data.length);
      return paginatedResponse;
    } catch (error) {
      console.error('Error fetching filtered stocks:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch filtered stocks');
    }
  },

  /**
   * Fetch stock metrics from /FindAllProductsWithStockLite (shows all products)
   * This is slower but provides important statistics
   */
  async getStockMetrics(): Promise<{
    totalItems: number;
    totalStockQty: number;
    lowStockCount: number;
    outOfStockCount: number;
  }> {
    try {
      const response = await fetch(`${FIND_ALL_PRODUCTS_WITH_STOCK_LITE_URL}?per_page=1`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock metrics');
      }
      
      const data: PaginatedStockResponse = await response.json();
      
      return {
        totalItems: data.total_count || 0,
        totalStockQty: data.total_stock_qty || 0,
        lowStockCount: data.low_stock_count || 0,
        outOfStockCount: data.out_of_stock_count || 0
      };
    } catch (error) {
      console.error('Error fetching stock metrics:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch stock metrics');
    }
  },

  /**
   * Fetch total stock quantity from dedicated endpoint
   */
  async getTotalStockQuantity(): Promise<number> {
    try {
      console.log('🔍 Fetching total stock quantity from:', GET_TOTAL_STOCK_QUANTITY_URL);
      const response = await fetch(GET_TOTAL_STOCK_QUANTITY_URL);
      
      if (!response.ok) {
        throw new Error('Failed to fetch total stock quantity');
      }
      
      const data = await response.json();
      console.log('📊 Total stock quantity response:', data);
      return data.total_stock_quantity || 0;
    } catch (error) {
      console.error('Error fetching total stock quantity:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch total stock quantity');
    }
  },

  /**
   * Fetch stock status counts from dedicated endpoint
   */
  async getStockStatusCounts(): Promise<{
    total: number;
    lowStock: number;
    averageStock: number;
    goodStock: number;
  }> {
    try {
      console.log('🔍 Fetching stock status counts from:', GET_STOCK_STATUS_COUNTS_URL);
      const response = await fetch(GET_STOCK_STATUS_COUNTS_URL);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock status counts');
      }
      
      const data = await response.json();
      console.log('📊 Stock status counts response:', data);
      return {
        total: data.total || 0,
        lowStock: data.low_stock || 0,
        averageStock: data.average_stock || 0,
        goodStock: data.good_stock || 0
      };
    } catch (error) {
      console.error('Error fetching stock status counts:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch stock status counts');
    }
  },

  /**
   * Get cached metrics from localStorage
   */
  getCachedMetrics(): CachedStockMetrics | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const metrics: CachedStockMetrics = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - metrics.timestamp < CACHE_DURATION) {
        return metrics;
      }
      
      // Cache expired
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  },

  /**
   * Save metrics to localStorage cache
   */
  setCachedMetrics(metrics: Omit<CachedStockMetrics, 'timestamp'>): void {
    try {
      const cacheData: CachedStockMetrics = {
        ...metrics,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  },

  /**
   * Get stock status badge variant based on quantity
   */
  getStockStatus(stockQty: number): 'Good Stock' | 'Medium Stock' | 'Low Stock' | 'Out of Stock' {
    if (stockQty === 0) return 'Out of Stock';
    if (stockQty < 10) return 'Low Stock';
    if (stockQty < 50) return 'Medium Stock';
    return 'Good Stock';
  },

  /**
   * Normalize status values from API (handles both "Low" and "Low Stock" formats)
   */
  normalizeStatus(status: string): 'Good Stock' | 'Medium Stock' | 'Low Stock' | 'Out of Stock' | 'Average Stock' {
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'low' || statusLower === 'low stock') return 'Low Stock';
    if (statusLower === 'average' || statusLower === 'average stock' || statusLower === 'medium stock') return 'Average Stock';
    if (statusLower === 'good' || statusLower === 'good stock') return 'Good Stock';
    if (statusLower === 'out of stock') return 'Out of Stock';
    
    // Default fallback
    return status as any;
  },

  /**
   * Check if expiry date is within 30 days
   */
  isExpiringSoon(expiryDate: string): boolean {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  },

  /**
   * Check if the expiry date has passed
   */
  isExpired(expiryDate: string): boolean {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  },

  /**
   * Format date to readable string
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  },

  /**
   * Add new stock to an existing product
   */
  async addStock(data: {
    productId: string;
    stockQty: number;
    expiryDate: string;
    costPrice: number;
    sellingPrice: number;
  }): Promise<any> {
    try {
      console.log('📦 Adding stock with data:', data);
      const response = await fetch(ADD_STOCK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to add stock: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Stock added successfully:', result);
      return result;
    } catch (error) {
      console.error('Error adding stock:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to add stock');
    }
  }
};
