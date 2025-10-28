// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { DollarSign, ShoppingCart, RotateCcw, TrendingUp, Package } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { SalesDetailModal } from "@/components/dashboard/SalesDetailModal";
import { StockDetailModal } from "@/components/dashboard/StockDetailModal";
import { GRNDetailModal } from "@/components/dashboard/GRNDetailModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { salesService, formatDateForAPI, SalesData } from "@/components/dashboard/salesService";
import { dashboardService } from "@/components/dashboard/dashboardService";

export default function Dashboard() {
  const [todaySales, setTodaySales] = useState<number>(0);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [grnsCount, setGrnsCount] = useState<number>(0);
  
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isGRNModalOpen, setIsGRNModalOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isStockLoading, setIsStockLoading] = useState(true);
  const [isGRNLoading, setIsGRNLoading] = useState(true);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isStockModalLoading, setIsStockModalLoading] = useState(false);
  const [isGRNModalLoading, setIsGRNModalLoading] = useState(false);

  useEffect(() => {
    fetchTodaySales();
    fetchStockQuantity();
    fetchGRNsCount();
  }, []);

  const fetchTodaySales = async () => {
    try {
      setIsLoading(true);
      const today = new Date();
      const offset = 5.5 * 60 * 60 * 1000;
      const localDate = new Date(today.getTime() + offset);
      const dateString = formatDateForAPI(localDate);
      
      const data = await salesService.getDailySalesSummary(dateString);
      setTodaySales(data.totalSales);
      setSalesData(data);
    } catch (error) {
      console.error('Failed to fetch today sales:', error);
      setTodaySales(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStockQuantity = async () => {
    try {
      setIsStockLoading(true);
      const quantity = await dashboardService.getTotalStockQuantity();
      setStockQuantity(quantity);
    } catch (error) {
      console.error('Failed to fetch stock quantity:', error);
      setStockQuantity(0);
    } finally {
      setIsStockLoading(false);
    }
  };

  const fetchGRNsCount = async () => {
    try {
      setIsGRNLoading(true);
      const count = await dashboardService.getTotalGRNsCount();
      setGrnsCount(count);
    } catch (error) {
      console.error('Failed to fetch GRNs count:', error);
      setGrnsCount(0);
    } finally {
      setIsGRNLoading(false);
    }
  };

  const handleSalesCardClick = async () => {
    setIsSalesModalOpen(true);
    if (!salesData) {
      setIsModalLoading(true);
      try {
        const today = new Date();
        const offset = 5.5 * 60 * 60 * 1000;
        const localDate = new Date(today.getTime() + offset);
        const dateString = formatDateForAPI(localDate);
        
        const data = await salesService.getDailySalesSummary(dateString);
        setSalesData(data);
      } catch (error) {
        console.error('Failed to fetch sales details:', error);
      } finally {
        setIsModalLoading(false);
      }
    }
  };

  const handleStockCardClick = async () => {
    setIsStockModalOpen(true);
    if (stockQuantity === 0 && !isStockLoading) {
      setIsStockModalLoading(true);
      try {
        const quantity = await dashboardService.getTotalStockQuantity();
        setStockQuantity(quantity);
      } catch (error) {
        console.error('Failed to fetch stock details:', error);
      } finally {
        setIsStockModalLoading(false);
      }
    }
  };

  const handleGRNCardClick = async () => {
    setIsGRNModalOpen(true);
    if (grnsCount === 0 && !isGRNLoading) {
      setIsGRNModalLoading(true);
      try {
        const count = await dashboardService.getTotalGRNsCount();
        setGrnsCount(count);
      } catch (error) {
        console.error('Failed to fetch GRN details:', error);
      } finally {
        setIsGRNModalLoading(false);
      }
    }
  };

  const lowStockAlerts = [
    {
      id: "1",
      title: "Pepsi 500ml",
      message: "Only 2 items left in stock",
      type: "warning" as const,
      date: "Today, 2:30 PM"
    }
  ];

  const expiredAlerts = [
    {
      id: "1",
      title: "Yoghurt Cup 100g",
      message: "Expired on 2025-08-15",
      type: "error" as const,
      date: "2 days ago"
    }
  ];

  const popularProducts = [
    { name: "Pepsi 500ml", sold: 45, revenue: "Rs. 8,100.00" },
    { name: "Milo 200ml", sold: 32, revenue: "Rs. 4,800.00" },
    { name: "Anchor Milk Powder", sold: 28, revenue: "Rs. 26,600.00" },
    { name: "Sunlight Soap", sold: 25, revenue: "Rs. 3,000.00" },
    { name: "Dettol Handwash", sold: 18, revenue: "Rs. 6,120.00" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Today's overview • {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1 self-start sm:self-auto">
          Live Data
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div 
          onClick={handleSalesCardClick}
          className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
        >
          <MetricCard
            title="Today Sales"
            value={isLoading ? "Loading..." : `Rs. ${todaySales.toLocaleString()}`}
            icon={DollarSign}
            trend="+12% from yesterday"
            trendUp={true}
          />
        </div>
        <div 
          onClick={handleStockCardClick}
          className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
        >
          <MetricCard
            title="Available Stocks"
            value={isStockLoading ? "Loading..." : stockQuantity.toLocaleString()}
            icon={ShoppingCart}
            trend="Total units in stock"
            trendUp={true}
          />
        </div>
        <div 
          onClick={handleGRNCardClick}
          className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
        >
          <MetricCard
            title="Today GRNs"
            value={isGRNLoading ? "Loading..." : grnsCount.toString()}
            icon={RotateCcw}
            trend={`${grnsCount} ${grnsCount === 1 ? 'transaction' : 'transactions'} today`}
          />
        </div>
        <MetricCard
          title="Today Profit"
          value="Rs. 3,200.00"
          icon={TrendingUp}
          trend="+8% from yesterday"
          trendUp={true}
        />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {/* Low Stock Alerts */}
        <AlertCard
          title="Low Stock Alerts"
          alerts={lowStockAlerts}
        />

        {/* Expired Items */}
        <AlertCard
          title="Expired Items"
          alerts={expiredAlerts}
        />

        {/* Popular Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-accent" />
              Popular Products Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 sm:p-6">
            {popularProducts.map((product, index) => (
              <div key={product.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md bg-secondary gap-2 sm:gap-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sold} units sold</p>
                  </div>
                </div>
                <div className="text-left sm:text-right ml-9 sm:ml-0">
                  <p className="text-sm font-medium text-accent">{product.revenue}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <p className="text-2xl font-bold text-primary">156</p>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-warning">12</p>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-success">89%</p>
              <p className="text-sm text-muted-foreground">Stock Health</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-accent">25</p>
              <p className="text-sm text-muted-foreground">Active Suppliers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <SalesDetailModal
        isOpen={isSalesModalOpen}
        onClose={() => setIsSalesModalOpen(false)}
        salesData={salesData}
        isLoading={isModalLoading}
      />
      
      <StockDetailModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        stockQuantity={stockQuantity}
        isLoading={isStockModalLoading}
      />
      
      <GRNDetailModal
        isOpen={isGRNModalOpen}
        onClose={() => setIsGRNModalOpen(false)}
        grnsCount={grnsCount}
        isLoading={isGRNModalLoading}
      />
    </div>
  );
}