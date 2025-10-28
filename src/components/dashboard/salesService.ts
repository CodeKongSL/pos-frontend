// src/components/dashboard/salesService.ts
const API_BASE_URL = 'https://my-go-backend.onrender.com';

export interface SalesData {
  reportDate: string;
  totalSales: number;
  totalRevenue: number;
  totalDiscount: number;
  totalTax: number;
  cashSales: number;
  cardSales: number;
  cashRevenue: number;
  cardRevenue: number;
  productsSold: any[];
  topSellingItems: any[];
}

export interface SalesResponse {
  data: SalesData;
  message: string;
}

export const salesService = {
  getDailySalesSummary: async (date: string): Promise<SalesData> => {
    try {
      const response = await fetch(`${API_BASE_URL}/GetDailySalesSummary?date=${date}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sales data');
      }
      
      const result: SalesResponse = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching sales summary:', error);
      throw error;
    }
  }
};

export const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatCurrency = (amount: number): string => {
  return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};