// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, ShoppingCart, RotateCcw, TrendingUp, Package, AlertTriangle } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesDetailModal } from "@/components/dashboard/SalesDetailModal";
import { StockDetailModal } from "@/components/dashboard/StockDetailModal";
import { GRNDetailModal } from "@/components/dashboard/GRNDetailModal";
import { PopularProductsDetailModal } from "@/components/dashboard/PopularProductsDetailModal";
import { ProfitDetailModal } from "@/components/dashboard/ProfitDetailModal";
import { LowStockDetailModal } from "@/components/dashboard/LowStockDetailModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { salesService, formatDateForAPI, SalesData } from "@/components/dashboard/salesService";
import { dashboardService, ProfitResponse, LowStockProduct, ExpiringStock, ExpiringStocksResponse } from "@/components/dashboard/dashboardService";
import { ExpiringStocksDetailModal } from "@/components/dashboard/ExpiringStocksDetailModal";

interface TopSellingItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [todaySales, setTodaySales] = useState<number>(0);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [grnsCount, setGrnsCount] = useState<number>(0);
  const [profitData, setProfitData] = useState<ProfitResponse | null>(null);
  const [topSellingItems, setTopSellingItems] = useState<TopSellingItem[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [expiringStocks, setExpiringStocks] = useState<ExpiringStock[]>([]);
  const [isExpiringStocksLoading, setIsExpiringStocksLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalCategories, setTotalCategories] = useState<number>(0);
  const [totalBrands, setTotalBrands] = useState<number>(0);
  
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isGRNModalOpen, setIsGRNModalOpen] = useState(false);
  const [isPopularProductsModalOpen, setIsPopularProductsModalOpen] = useState(false);
  const [isProfitModalOpen, setIsProfitModalOpen] = useState(false);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [isExpiringStocksModalOpen, setIsExpiringStocksModalOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isStockLoading, setIsStockLoading] = useState(true);
  const [isGRNLoading, setIsGRNLoading] = useState(true);
  const [isProfitLoading, setIsProfitLoading] = useState(true);
  const [isLowStockLoading, setIsLowStockLoading] = useState(true);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isStockModalLoading, setIsStockModalLoading] = useState(false);
  const [isGRNModalLoading, setIsGRNModalLoading] = useState(false);
  const [isProfitModalLoading, setIsProfitModalLoading] = useState(false);
  const [isPopularProductsLoading, setIsPopularProductsLoading] = useState(false);
  const [isLowStockModalLoading, setIsLowStockModalLoading] = useState(false);
  const [isExpiringStocksModalLoading, setIsExpiringStocksModalLoading] = useState(false);
  const [isTotalProductsLoading, setIsTotalProductsLoading] = useState(true);
  const [isTotalCategoriesLoading, setIsTotalCategoriesLoading] = useState(true);
  const [isTotalBrandsLoading, setIsTotalBrandsLoading] = useState(true);

  useEffect(() => {
    fetchTodaySales();
    fetchStockQuantity();
    fetchGRNsCount();
    fetchProfitData();
    fetchLowStockProducts();
    fetchExpiringStocks();
    fetchTotalProducts();
    fetchTotalCategories();
    fetchTotalBrands();
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
      setTopSellingItems(data.topSellingItems || []);
    } catch (error) {
      console.error('Failed to fetch today sales:', error);
      setTodaySales(0);
      setTopSellingItems([]);
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

  const fetchProfitData = async () => {
    try {
      setIsProfitLoading(true);
      const data = await dashboardService.getProfitData();
      setProfitData(data);
    } catch (error) {
      console.error('Failed to fetch profit data:', error);
      setProfitData(null);
    } finally {
      setIsProfitLoading(false);
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      setIsLowStockLoading(true);
      const products = await dashboardService.getLowStockProducts();
      setLowStockProducts(products);
    } catch (error) {
      console.error('Failed to fetch low stock products:', error);
      setLowStockProducts([]);
    } finally {
      setIsLowStockLoading(false);
    }
  };
  const fetchExpiringStocks = async () => {
    try {
      setIsExpiringStocksLoading(true);
      const data = await dashboardService.getExpiringStocks();
      setExpiringStocks(data.expiring_stocks);
    } catch (error) {
      console.error('Failed to fetch expiring stocks:', error);
      setExpiringStocks([]);
    } finally {
      setIsExpiringStocksLoading(false);
    }
  };

  const fetchTotalProducts = async () => {
    try {
      setIsTotalProductsLoading(true);
      const count = await dashboardService.getTotalProducts();
      setTotalProducts(count);
    } catch (error) {
      console.error('Failed to fetch total products:', error);
      setTotalProducts(0);
    } finally {
      setIsTotalProductsLoading(false);
    }
  };

  const fetchTotalCategories = async () => {
    try {
      setIsTotalCategoriesLoading(true);
      const count = await dashboardService.getTotalCategories();
      setTotalCategories(count);
    } catch (error) {
      console.error('Failed to fetch total categories:', error);
      setTotalCategories(0);
    } finally {
      setIsTotalCategoriesLoading(false);
    }
  };
  const fetchTotalBrands = async () => {
    try {
      setIsTotalBrandsLoading(true);
      const count = await dashboardService.getTotalBrands();
      setTotalBrands(count);
    } catch (error) {
      console.error('Failed to fetch total brands:', error);
      setTotalBrands(0);
    } finally {
      setIsTotalBrandsLoading(false);
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

  const handleProfitCardClick = async () => {
    setIsProfitModalOpen(true);
    if (!profitData && !isProfitLoading) {
      setIsProfitModalLoading(true);
      try {
        const data = await dashboardService.getProfitData();
        setProfitData(data);
      } catch (error) {
        console.error('Failed to fetch profit details:', error);
      } finally {
        setIsProfitModalLoading(false);
      }
    }
  };

  const handlePopularProductsClick = async () => {
    setIsPopularProductsModalOpen(true);
    if (topSellingItems.length === 0 && !isLoading) {
      setIsPopularProductsLoading(true);
      try {
        const today = new Date();
        const offset = 5.5 * 60 * 60 * 1000;
        const localDate = new Date(today.getTime() + offset);
        const dateString = formatDateForAPI(localDate);
        
        const data = await salesService.getDailySalesSummary(dateString);
        setTopSellingItems(data.topSellingItems || []);
      } catch (error) {
        console.error('Failed to fetch popular products:', error);
      } finally {
        setIsPopularProductsLoading(false);
      }
    }
  };

  const handleLowStockCardClick = async () => {
    setIsLowStockModalOpen(true);
    if (lowStockProducts.length === 0 && !isLowStockLoading) {
      setIsLowStockModalLoading(true);
      try {
        const products = await dashboardService.getLowStockProducts();
        setLowStockProducts(products);
      } catch (error) {
        console.error('Failed to fetch low stock products:', error);
      } finally {
        setIsLowStockModalLoading(false);
      }
    }
  };

  const handleExpiringStocksCardClick = async () => {
    setIsExpiringStocksModalOpen(true);
    if (expiringStocks.length === 0 && !isExpiringStocksLoading) {
      setIsExpiringStocksModalLoading(true);
      try {
        const data = await dashboardService.getExpiringStocks();
        setExpiringStocks(data.expiring_stocks);
      } catch (error) {
        console.error('Failed to fetch expiring stocks:', error);
      } finally {
        setIsExpiringStocksModalLoading(false);
      }
    }
  };

  const formatCurrency = (amount: number): string => {
    return `Rs. ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Get top 5 expiring items for card display
  const displayExpiringItems = expiringStocks.slice(0, 5);

  // Get top 5 low stock items for card display
  const displayLowStockItems = lowStockProducts.slice(0, 5);

  // Get top 5 items for display
  const displayTopItems = topSellingItems.slice(0, 5);

  const handleTotalProductsClick = () => {
    navigate("/products");
  };

  const handleTotalBrandsClick = () => {
    navigate("/brands");
  };

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
            title="Total GRNs"
            value={isGRNLoading ? "Loading..." : grnsCount.toString()}
            icon={RotateCcw}
            trend={`${grnsCount} ${grnsCount === 1 ? 'transaction' : 'transactions'} today`}
          />
        </div>
        <div 
          onClick={handleProfitCardClick}
          className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
        >
          <MetricCard
            title="Expected Profit"
            value={isProfitLoading ? "Loading..." : profitData ? formatCurrency(profitData.target_profit) : "Rs. 0.00"}
            icon={TrendingUp}
            trend="Click for details"
            trendUp={true}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {/* Low Stock Alerts */}
        <Card 
          className="cursor-pointer transition-all hover:shadow-lg"
          onClick={handleLowStockCardClick}
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 sm:p-6">
            {isLowStockLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : displayLowStockItems.length > 0 ? (
              displayLowStockItems.map((product) => (
                <div key={product.productId} className="flex items-start gap-3 p-3 rounded-md bg-warning/5 border border-warning/20">
                  <AlertTriangle className="h-4 w-4 text-warning mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                      <Badge variant={product.stockQty <= 3 ? "destructive" : "outline"} className="text-xs flex-shrink-0">
                        {product.stockQty <= 3 ? "Critical" : "Warning"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Only {product.stockQty} {product.stockQty === 1 ? 'item' : 'items'} left in stock
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(product.updated_at)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No low stock alerts
              </div>
            )}
            {lowStockProducts.length > 5 && (
              <div className="text-center pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  +{lowStockProducts.length - 5} more items. Click to view all
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expired Items */}
        <Card 
          className="cursor-pointer transition-all hover:shadow-lg"
          onClick={handleExpiringStocksCardClick}
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Expiring Items (Next 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 sm:p-6">
            {isExpiringStocksLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : displayExpiringItems.length > 0 ? (
              displayExpiringItems.map((stock, index) => (
                <div key={`${stock.product_id}-${stock.batch_id || index}`} className="flex items-start gap-3 p-3 rounded-md bg-destructive/5 border border-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">{stock.product_name}</p>
                      <Badge variant="destructive" className="text-xs flex-shrink-0">
                        Critical
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Expires on {new Date(stock.expiry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stock.stock_qty} {stock.stock_qty === 1 ? 'unit' : 'units'} • {stock.batch_id || 'No batch'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No items expiring soon
              </div>
            )}
            {expiringStocks.length > 5 && (
              <div className="text-center pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  +{expiringStocks.length - 5} more items. Click to view all
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Products */}
        <Card 
          className="cursor-pointer transition-all hover:shadow-lg"
          onClick={handlePopularProductsClick}
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-accent" />
              Popular Products Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : displayTopItems.length > 0 ? (
              displayTopItems.map((item, index) => (
                <div key={item.productId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md bg-secondary gap-2 sm:gap-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity} units sold</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right ml-9 sm:ml-0">
                    <p className="text-sm font-medium text-accent">{formatCurrency(item.totalAmount)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No products sold today
              </div>
            )}
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
            <div className="space-y-2 cursor-pointer transition hover:scale-105 hover:shadow-lg" onClick={handleTotalProductsClick} title="View all products">
              <p className="text-2xl font-bold text-primary">{isTotalProductsLoading ? "..." : totalProducts}</p>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </div>
            <div className="space-y-2 cursor-pointer transition hover:scale-105 hover:shadow-lg" onClick={handleTotalBrandsClick} title="View all brands">
              <p className="text-2xl font-bold text-warning">{isTotalBrandsLoading ? "..." : totalBrands}</p>
              <p className="text-sm text-muted-foreground">Total Brands</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-success">{isTotalCategoriesLoading ? "..." : totalCategories}</p>
              <p className="text-sm text-muted-foreground">Total Categories</p>
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

      <PopularProductsDetailModal
        isOpen={isPopularProductsModalOpen}
        onClose={() => setIsPopularProductsModalOpen(false)}
        topSellingItems={topSellingItems}
        isLoading={isPopularProductsLoading}
      />

      <ProfitDetailModal
        isOpen={isProfitModalOpen}
        onClose={() => setIsProfitModalOpen(false)}
        profitData={profitData}
        isLoading={isProfitModalLoading}
      />

      <LowStockDetailModal
        isOpen={isLowStockModalOpen}
        onClose={() => setIsLowStockModalOpen(false)}
        lowStockProducts={lowStockProducts}
        isLoading={isLowStockModalLoading}
      />

      <ExpiringStocksDetailModal
        isOpen={isExpiringStocksModalOpen}
        onClose={() => setIsExpiringStocksModalOpen(false)}
        expiringStocks={expiringStocks}
        isLoading={isExpiringStocksModalLoading}
      />
    </div>
  );
}