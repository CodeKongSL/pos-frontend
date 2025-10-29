// src/components/dashboard/dashboardService.ts

const API_BASE_URL = 'https://my-go-backend.onrender.com';

export interface StockQuantityResponse {
  total_stock_quantity: number;
}

export interface GRNsCountResponse {
  total_grns: number;
}

export interface ProfitResponse {
  sales_target: number;
  target_profit: number;
  total_spend: number;
}

export interface BatchInfo {
  batchId: string;
  stockQty: number;
  expiry_date: string;
  costPrice: number;
  sellingPrice: number;
  created_at: string;
  updated_at: string;
}

export interface LowStockProduct {
  productId: string;
  name: string;
  barcode: string;
  categoryId: string;
  brandId: string;
  subCategoryId: string;
  costPrice: number;
  sellingPrice: number;
  stockQty: number;
  expiry_date: string;
  batches?: BatchInfo[];
  deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpiringStock {
  batch_id: string;
  expiry_date: string;
  product_id: string;
  product_name: string;
  product_status: string;
  stock_qty: number;
}

export interface ExpiringStocksResponse {
  expiring_stocks: ExpiringStock[];
  now: string;
  timezone: string;
}

class DashboardService {
  async getTotalStockQuantity(): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/GetTotalStockQuantity`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: StockQuantityResponse = await response.json();
      return data.total_stock_quantity;
    } catch (error) {
      console.error('Error fetching total stock quantity:', error);
      throw error;
    }
  }

  async getTotalGRNsCount(): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/GetTotalGRNsCount`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: GRNsCountResponse = await response.json();
      return data.total_grns;
    } catch (error) {
      console.error('Error fetching total GRNs count:', error);
      throw error;
    }
  }

  async getProfitData(): Promise<ProfitResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/CalculateTotalCost`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ProfitResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching profit data:', error);
      throw error;
    }
  }

  async getLowStockProducts(): Promise<LowStockProduct[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/GetLowStockProducts`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: LowStockProduct[] = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }
  async getExpiringStocks(): Promise<ExpiringStocksResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/GetExpiringStocksNext7Days`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ExpiringStocksResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching expiring stocks:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();