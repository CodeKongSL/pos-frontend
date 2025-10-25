export interface Stock {
  id: string;
  productId: string;
  batchId?: string;  // Batch identifier
  name: string;
  stockQty: number;
  status: "Low Stock" | "Average Stock" | "Good Stock" | "Out of Stock";
  expiry_date: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedStockResponse {
  data: Stock[];
  next_cursor?: string;
  has_more: boolean;
  total_count?: number; // Total count from /FindAllStocks
  total_stock_qty?: number; // Aggregate quantity
  low_stock_count?: number; // Items with qty < 10
  out_of_stock_count?: number; // Items with qty = 0
}

export interface StockPaginationParams {
  per_page?: number;
  cursor?: string;
}

export interface CachedStockMetrics {
  totalItems: number;
  totalStockQty: number;
  lowStockCount: number;
  averageStock: number;
  outOfStockCount: number;
  timestamp: number;
}
