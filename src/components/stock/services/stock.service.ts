import { Stock, PaginatedStockResponse, StockPaginationParams, CachedStockMetrics } from '../models/stock.model';

// Get API base URL from environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://my-go-backend.onrender.com';

const FIND_ALL_STOCKS_URL = `${API_BASE_URL}/FindAllStocks`;
const FIND_ALL_STOCKS_LITE_URL = `${API_BASE_URL}/FindAllStocksLite`;
const GET_TOTAL_STOCK_QUANTITY_URL = `${API_BASE_URL}/GetTotalStockQuantity`;

const CACHE_KEY = 'stock_metrics_cache';
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes

export const StockService = {
  /**
   * Fetch stocks with lite pagination (faster, no aggregate counts)
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
      
      const url = `${FIND_ALL_STOCKS_LITE_URL}?${queryParams.toString()}`;
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
   * Fetch stock metrics from /FindAllStocks (with aggregate counts)
   * This is slower but provides important statistics
   */
  async getStockMetrics(): Promise<{
    totalItems: number;
    totalStockQty: number;
    lowStockCount: number;
    outOfStockCount: number;
  }> {
    try {
      const response = await fetch(`${FIND_ALL_STOCKS_URL}?per_page=1`);
      
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
      const response = await fetch(GET_TOTAL_STOCK_QUANTITY_URL);
      
      if (!response.ok) {
        throw new Error('Failed to fetch total stock quantity');
      }
      
      const data = await response.json();
      return data.total_stock_quantity || 0;
    } catch (error) {
      console.error('Error fetching total stock quantity:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch total stock quantity');
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
  }
};
