import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Package, AlertCircle, RefreshCcw, ChevronLeft, ChevronRight, X, ChevronDown, Database, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Stock } from "@/components/stock/models/stock.model";
import { StockService } from "@/components/stock/services/stock.service";
import AddStockDialog from "@/components/AddStockDialog";
import EditStockOptionsDialog from "@/components/EditStockOptionsDialog";
import ChangeStockQuantityDialog from "@/components/ChangeStockQuantityDialog";
import ChangeStockDetailsDialog from "@/components/ChangeStockDetailsDialog";
import DeleteStockDialog from "@/components/DeleteStockDialog";

// Performance: Only log in development mode
const isDev = import.meta.env.DEV;
const devLog = (...args: any[]) => {
  if (isDev) console.log(...args);
};

export default function Stocks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'average'>('all');

  // Cached metrics state
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalStockQty, setTotalStockQty] = useState<number>(0);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [averageStockCount, setAverageStockCount] = useState<number>(0);
  const [goodStockCount, setGoodStockCount] = useState<number>(0);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState<boolean>(true);
  const [isLoadingTotalQty, setIsLoadingTotalQty] = useState<boolean>(true);
  const [isLoadingStatusCounts, setIsLoadingStatusCounts] = useState<boolean>(true);
  const [isMetricsCached, setIsMetricsCached] = useState<boolean>(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  // Add Stock Dialog state
  const [addStockDialog, setAddStockDialog] = useState<{
    open: boolean;
    productId: string;
    productName: string;
  }>({
    open: false,
    productId: "",
    productName: "",
  });

  // Edit Stock Options Dialog state
  const [editStockOptionsDialog, setEditStockOptionsDialog] = useState<{
    open: boolean;
    productId: string;
    productName: string;
  }>({
    open: false,
    productId: "",
    productName: "",
  });

  // Change Stock Quantity Dialog state
  const [changeQuantityDialog, setChangeQuantityDialog] = useState<{
    open: boolean;
    productId: string;
    productName: string;
    batches: Stock[];
  }>({
    open: false,
    productId: "",
    productName: "",
    batches: [],
  });

  // Change Stock Details Dialog state
  const [changeDetailsDialog, setChangeDetailsDialog] = useState<{
    open: boolean;
    productId: string;
    productName: string;
    batches: Stock[];
  }>({
    open: false,
    productId: "",
    productName: "",
    batches: [],
  });

  // Delete Stock Dialog state
  const [deleteStockDialog, setDeleteStockDialog] = useState<{
    open: boolean;
    productId: string;
    productName: string;
    batches: Stock[];
  }>({
    open: false,
    productId: "",
    productName: "",
    batches: [],
  });

  // Pagination state
  const [perPage, setPerPage] = useState<number>(15);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [cursors, setCursors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchStocks = async (cursor?: string | null, resetPagination = false) => {
    setIsLoading(true);
    setError(null);
    devLog('fetchStocks called with cursor:', cursor, 'resetPagination:', resetPagination, 'perPage:', perPage);
    
    try {
      // If resetPagination is true, don't use any cursor (start from beginning)
      const apiCursor = resetPagination ? undefined : (cursor || undefined);
      devLog('Using API cursor:', apiCursor);
      
      const params = {
        per_page: perPage,
        cursor: apiCursor,
      };
      
      let data: any;
      
      // Choose the appropriate API based on filter
      if (statusFilter === 'low') {
        data = await StockService.getFilteredStocks('low', params);
      } else if (statusFilter === 'average') {
        data = await StockService.getFilteredStocks('average', params);
      } else {
        data = await StockService.getAllStocksLite(params);
      }
      
      devLog('Stocks response:', data);
      devLog('Setting stocks count:', data.data.length);
      devLog('Pagination state - next_cursor:', data.next_cursor, 'has_more:', data.has_more);
      
      setStocks(data.data);
      setNextCursor(data.next_cursor || null);
      setHasMore(data.has_more);
      
      // Only set current cursor if we're not resetting pagination
      if (!resetPagination) {
        setCurrentCursor(cursor || null);
      } else {
        setCurrentCursor(null);
      }
      
      // Reset pagination tracking if needed
      if (resetPagination) {
        setCursors([]);
        setCurrentPage(1);
        devLog('Reset pagination tracking');
      }
      
    } catch (error) {
      console.error("Error fetching stocks:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stocks';
      setError(errorMessage);
      setStocks([]);
      setNextCursor(null);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load: fetch metrics (with cache check) + first page
  useEffect(() => {
    // Try to load from cache first
    const cachedMetrics = StockService.getCachedMetrics();
    
    if (cachedMetrics) {
      // Use cached data
      devLog('Using cached metrics:', cachedMetrics);
      setTotalItems(cachedMetrics.totalItems);
      setTotalStockQty(cachedMetrics.totalStockQty);
      setLowStockCount(cachedMetrics.lowStockCount);
      setAverageStockCount(cachedMetrics.averageStock || 0);
      setIsLoadingStatusCounts(false);
      setIsLoadingTotalQty(false);
      setIsMetricsCached(true);
      
      // Still fetch fresh data in background to update cache
      fetchStockStatusCounts(true);
      fetchTotalStockQuantity(true);
    } else {
      // No cache, fetch fresh data
      devLog('No cached metrics found, fetching fresh data');
      fetchStockStatusCounts();
      fetchTotalStockQuantity();
    }
    
    // Always fetch first page of stocks
    fetchStocks(null, true);
  }, []);

  // Re-fetch stocks when filter or perPage changes
  useEffect(() => {
    fetchStocks(null, true);
  }, [statusFilter]);

  // Handle per page change
  const handlePerPageChange = async (value: string) => {
    const newPerPage = parseInt(value);
    devLog('Changing per page from', perPage, 'to', newPerPage);
    setPerPage(newPerPage);
    // Reset to first page when changing per page
    devLog('Resetting pagination to first page');
    
    // Manually call the API with the new perPage value
    setIsLoading(true);
    setError(null);
    devLog('fetchData called with new perPage:', newPerPage, 'resetPagination: true');
    
    try {
      let data: any;
      
      // Choose the appropriate API based on filter
      if (statusFilter === 'low') {
        data = await StockService.getFilteredStocks('low', { per_page: newPerPage, cursor: undefined });
      } else if (statusFilter === 'average') {
        data = await StockService.getFilteredStocks('average', { per_page: newPerPage, cursor: undefined });
      } else {
        data = await StockService.getAllStocksLite({ per_page: newPerPage, cursor: undefined });
      }
      
      devLog('Stocks response:', data);
      devLog('Setting stocks count:', data.data.length);
      devLog('Pagination state - next_cursor:', data.next_cursor, 'has_more:', data.has_more);
      
      setStocks(data.data);
      setNextCursor(data.next_cursor || null);
      setHasMore(data.has_more);
      setCurrentCursor(null);
      setCursors([]);
      setCurrentPage(1);
      devLog('Reset pagination tracking');
      
    } catch (error) {
      console.error("Error fetching stocks:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stocks';
      setError(errorMessage);
      setStocks([]);
      setNextCursor(null);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle next page - memoized
  const handleNextPage = useCallback(() => {
    if (hasMore && nextCursor) {
      devLog('Moving to next page, current cursor:', currentCursor, 'next cursor:', nextCursor);
      // Store current cursor for back navigation
      setCursors(prev => {
        const newCursors = [...prev];
        if (currentCursor !== null) {
          newCursors.push(currentCursor);
        }
        return newCursors;
      });
      setCurrentPage(prev => prev + 1);
      fetchStocks(nextCursor);
    }
  }, [hasMore, nextCursor, currentCursor]);

  // Handle previous page - memoized
  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCursors(prev => {
        const newCursors = [...prev];
        const prevCursor = newCursors.pop();
        devLog('Moving to previous page, current page:', currentPage, 'prev cursor:', prevCursor);
        setCurrentPage(currentPage - 1);
        // If we're going back to page 1, use null cursor
        fetchStocks(currentPage === 2 ? null : prevCursor || null);
        return newCursors;
      });
    }
  }, [currentPage]);

  // Fetch total stock quantity from dedicated endpoint
  const fetchTotalStockQuantity = async (isBackgroundUpdate = false) => {
    if (!isBackgroundUpdate) {
      setIsLoadingTotalQty(true);
      setIsMetricsCached(false);
    }
    
    try {
      const totalQty = await StockService.getTotalStockQuantity();
      setTotalStockQty(totalQty);
      
      // Update cache
      const cachedMetrics = StockService.getCachedMetrics();
      if (cachedMetrics) {
        StockService.setCachedMetrics({
          ...cachedMetrics,
          totalStockQty: totalQty
        });
      }
    } catch (error) {
      console.error('Error fetching total stock quantity:', error);
      // Don't update error state here, as this is a background fetch
    } finally {
      if (!isBackgroundUpdate) {
        setIsLoadingTotalQty(false);
      }
    }
  };

  // Fetch stock status counts from dedicated endpoint
  const fetchStockStatusCounts = async (isBackgroundUpdate = false) => {
    if (!isBackgroundUpdate) {
      setIsLoadingStatusCounts(true);
      setIsMetricsCached(false);
    }
    
    try {
      const counts = await StockService.getStockStatusCounts();
      setTotalItems(counts.total);
      setLowStockCount(counts.lowStock);
      setAverageStockCount(counts.averageStock);
      
      // Update cache with fresh data
      StockService.setCachedMetrics({
        totalItems: counts.total,
        totalStockQty: totalStockQty, // Keep existing value
        lowStockCount: counts.lowStock,
        averageStock: counts.averageStock,
        outOfStockCount: 0 // Not currently tracked
      });
      
      if (isBackgroundUpdate) {
        devLog('Background metrics update completed');
      }
    } catch (error) {
      console.error('Error fetching stock status counts:', error);
      // Don't update error state here, as this is a background fetch
    } finally {
      if (!isBackgroundUpdate) {
        setIsLoadingStatusCounts(false);
      }
    }
  };

  // Handle refresh (including metrics) - memoized to prevent re-creation
  const handleRefresh = useCallback(() => {
    fetchStocks(currentCursor);
  }, [currentCursor]);

  // Handle metrics refresh - memoized
  const handleRefreshMetrics = useCallback(() => {
    fetchStockStatusCounts();
    fetchTotalStockQuantity();
  }, []);

  // Handle status filter click - memoized
  const handleStatusFilterClick = useCallback((filter: 'all' | 'low' | 'average') => {
    setStatusFilter(prevFilter => prevFilter === filter ? 'all' : filter);
  }, []);

  // Memoized filtered stocks - only recalculates when stocks or searchTerm changes
  const filteredStocks = useMemo(() => {
    if (!searchTerm.trim()) return stocks;
    
    const lowerSearch = searchTerm.toLowerCase();
    return stocks.filter(stock =>
      stock.name.toLowerCase().includes(lowerSearch) ||
      stock.productId.toLowerCase().includes(lowerSearch)
    );
  }, [stocks, searchTerm]);

  // Memoized grouped stocks - only recalculates when filteredStocks changes
  const groupedStocksArray = useMemo(() => {
    const grouped = filteredStocks.reduce((acc, stock) => {
      if (!acc[stock.productId]) {
        acc[stock.productId] = {
          productId: stock.productId,
          name: stock.name,
          batches: []
        };
      }
      acc[stock.productId].batches.push(stock);
      return acc;
    }, {} as Record<string, { productId: string; name: string; batches: Stock[] }>);
    
    return Object.values(grouped);
  }, [filteredStocks]);

  // Toggle function - memoized and optimized
  const toggleProduct = useCallback((productId: string) => {
    setExpandedProducts(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(productId)) {
        newExpanded.delete(productId);
      } else {
        newExpanded.add(productId);
      }
      return newExpanded;
    });
  }, []);

  // Memoized helper functions to prevent recalculation
  const getStockStatusBadge = useCallback((status: string) => {
    switch (status) {
      case "Out of Stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      case "Low Stock":
        return <Badge variant="outline" className="text-warning border-warning">Low Stock</Badge>;
      case "Medium Stock":
        return <Badge className="bg-blue-500 text-white">Medium Stock</Badge>;
      case "Good Stock":
        return <Badge className="bg-success text-success-foreground">Good Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }, []);

  // Memoized date formatting functions
  const formatDate = useCallback((dateString: string) => {
    return StockService.formatDate(dateString);
  }, []);

  const isExpiringSoon = useCallback((expiryDate: string) => {
    return StockService.isExpiringSoon(expiryDate);
  }, []);

  const isExpired = useCallback((expiryDate: string) => {
    return StockService.isExpired(expiryDate);
  }, []);

  // Handle add stock dialog
  const handleOpenAddStock = useCallback((productId: string, productName: string) => {
    setAddStockDialog({
      open: true,
      productId,
      productName,
    });
  }, []);

  const handleCloseAddStock = useCallback(() => {
    setAddStockDialog({
      open: false,
      productId: "",
      productName: "",
    });
  }, []);

  const handleAddStockSuccess = useCallback(() => {
    // Refresh the stocks list after successful addition
    fetchStocks(currentCursor);
    // Also refresh metrics
    fetchStockStatusCounts(true);
    fetchTotalStockQuantity(true);
  }, [currentCursor]);

  // Handle edit stock options dialog
  const handleOpenEditStockOptions = useCallback((productId: string, productName: string) => {
    setEditStockOptionsDialog({
      open: true,
      productId,
      productName,
    });
  }, []);

  const handleCloseEditStockOptions = useCallback(() => {
    setEditStockOptionsDialog({
      open: false,
      productId: "",
      productName: "",
    });
  }, []);

  const handleChangeQuantity = useCallback(() => {
    // Get the batches for the selected product
    const productBatches = filteredStocks.filter(
      stock => stock.productId === editStockOptionsDialog.productId
    );
    
    setChangeQuantityDialog({
      open: true,
      productId: editStockOptionsDialog.productId,
      productName: editStockOptionsDialog.productName,
      batches: productBatches,
    });
  }, [editStockOptionsDialog, filteredStocks]);

  const handleChangeDetails = useCallback(() => {
    // Get the batches for the selected product
    const productBatches = filteredStocks.filter(
      stock => stock.productId === editStockOptionsDialog.productId
    );
    
    setChangeDetailsDialog({
      open: true,
      productId: editStockOptionsDialog.productId,
      productName: editStockOptionsDialog.productName,
      batches: productBatches,
    });
  }, [editStockOptionsDialog, filteredStocks]);

  const handleCloseChangeQuantity = useCallback(() => {
    setChangeQuantityDialog({
      open: false,
      productId: "",
      productName: "",
      batches: [],
    });
  }, []);

  const handleCloseChangeDetails = useCallback(() => {
    setChangeDetailsDialog({
      open: false,
      productId: "",
      productName: "",
      batches: [],
    });
  }, []);

  const handleEditSuccess = useCallback(() => {
    // Refresh the stocks list after successful edit
    fetchStocks(currentCursor);
    // Also refresh metrics
    fetchStockStatusCounts(true);
    fetchTotalStockQuantity(true);
  }, [currentCursor]);

  const handleOpenDeleteStock = useCallback((productId: string, productName: string) => {
    // Get the batches for the selected product
    const productBatches = filteredStocks.filter(
      stock => stock.productId === productId
    );
    
    setDeleteStockDialog({
      open: true,
      productId,
      productName,
      batches: productBatches,
    });
  }, [filteredStocks]);

  const handleCloseDeleteStock = useCallback(() => {
    setDeleteStockDialog({
      open: false,
      productId: "",
      productName: "",
      batches: [],
    });
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    // Refresh the stocks list after successful deletion
    fetchStocks(currentCursor);
    // Also refresh metrics
    fetchStockStatusCounts(true);
    fetchTotalStockQuantity(true);
  }, [currentCursor]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Management</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">View and monitor your inventory stock levels</p>
            {isMetricsCached && !isLoadingStatusCounts && !isLoadingTotalQty && (
              <Badge variant="outline" className="text-xs gap-1">
                <Database className="h-3 w-3" />
                Cached
              </Badge>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshMetrics}
          disabled={isLoadingStatusCounts || isLoadingTotalQty}
          title="Refresh stock statistics"
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${isLoadingStatusCounts || isLoadingTotalQty ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                {isLoadingStatusCounts ? (
                  <div className="w-16 h-8 bg-muted animate-pulse rounded" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{totalItems}</p>
                )}
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                {isLoadingTotalQty ? (
                  <div className="w-16 h-8 bg-muted animate-pulse rounded" />
                ) : (
                  <p className="text-2xl font-bold text-success">{totalStockQty}</p>
                )}
                <p className="text-sm text-muted-foreground">Total Quantity</p>
              </div>
              <Package className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${statusFilter === 'low' ? 'ring-2 ring-warning' : ''}`}
          onClick={() => handleStatusFilterClick('low')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                {isLoadingStatusCounts ? (
                  <div className="w-16 h-8 bg-muted animate-pulse rounded" />
                ) : (
                  <p className="text-2xl font-bold text-warning">{lowStockCount}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Low Stock {statusFilter === 'low' && '(Filtered)'}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${statusFilter === 'average' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => handleStatusFilterClick('average')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                {isLoadingStatusCounts ? (
                  <div className="w-16 h-8 bg-muted animate-pulse rounded" />
                ) : (
                  <p className="text-2xl font-bold text-blue-500">{averageStockCount}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Average Stock {statusFilter === 'average' && '(Filtered)'}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Active Filter Indicator */}
            {statusFilter !== 'all' && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <Badge variant="outline" className={`
                  ${statusFilter === 'low' ? 'border-warning text-warning' : ''}
                  ${statusFilter === 'average' ? 'border-blue-500 text-blue-500' : ''}
                `}>
                  {statusFilter === 'low' ? 'Low Stock Filter' : 'Average Stock Filter'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Showing {statusFilter === 'low' ? 'low stock' : 'average stock'} items only
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className="ml-auto h-7"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filter
                </Button>
              </div>
            )}
            
            {/* Search and Per Page */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stocks by name or product ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stocks Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {statusFilter === 'low' ? 'Low Stock Items' : statusFilter === 'average' ? 'Average Stock Items' : 'Available Stocks'} 
            ({groupedStocksArray.length} product{groupedStocksArray.length !== 1 ? 's' : ''} on this page)
            {currentPage > 1 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                - Page {currentPage}
              </span>
            )}
          </CardTitle>
          {error && (
            <div className="mt-2 p-3 text-sm rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={handleRefresh}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-right">Total Batches</TableHead>
                  <TableHead className="text-right">Total Quantity</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                        <p className="text-sm text-muted-foreground">Loading stocks...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : groupedStocksArray.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-lg font-medium text-foreground mb-1">
                          {currentPage === 1 ? "No Stocks Found" : "No More Stocks"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {searchTerm 
                            ? "Try adjusting your search criteria"
                            : currentPage === 1 
                              ? "No stock items available at the moment"
                              : "You've reached the end of the stock list"}
                        </p>
                        {currentPage > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevPage}
                            className="mt-3"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Go back to previous page
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {groupedStocksArray.map((group) => {
                      const isExpanded = expandedProducts.has(group.productId);
                      const totalQty = group.batches.reduce((sum, batch) => sum + batch.stockQty, 0);
                      
                      return (
                        <>
                          {/* Product Row */}
                          <TableRow 
                            key={group.productId}
                            className="cursor-pointer hover:bg-muted/50 bg-muted/20 font-medium"
                            onClick={() => toggleProduct(group.productId)}
                          >
                            <TableCell>
                              <ChevronDown 
                                className={`h-4 w-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                              />
                            </TableCell>
                            <TableCell>{group.productId}</TableCell>
                            <TableCell>{group.name}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline">{group.batches.length} batch{group.batches.length !== 1 ? 'es' : ''}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-normal">{totalQty}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenAddStock(group.productId, group.name);
                                  }}
                                  title="Add new stock"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditStockOptions(group.productId, group.name);
                                  }}
                                  title="Edit stock"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDeleteStock(group.productId, group.name);
                                  }}
                                  title="Delete stock"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          
                          {/* Batch Rows - Compact Table Format */}
                          {isExpanded && (
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={6} className="p-0">
                                <div className="px-4 py-3">
                                  <div className="rounded-lg border bg-background overflow-hidden">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-muted/50">
                                          <TableHead className="h-9 text-xs">Batch ID</TableHead>
                                          <TableHead className="h-9 text-xs">Quantity</TableHead>
                                          <TableHead className="h-9 text-xs">Expiry Date</TableHead>
                                          <TableHead className="h-9 text-xs">Status</TableHead>
                                          <TableHead className="h-9 text-xs hidden lg:table-cell">Created</TableHead>
                                          <TableHead className="h-9 text-xs hidden lg:table-cell">Updated</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {group.batches.map((stock) => (
                                          <TableRow key={stock.id} className="hover:bg-muted/30">
                                            <TableCell className="py-3">
                                              {stock.batchId ? (
                                                <span className="text-xs">{stock.batchId}</span>
                                              ) : (
                                                <span className="text-muted-foreground text-xs italic">No batch</span>
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              <span className={`font-semibold ${stock.stockQty < 10 ? 'text-warning' : 'text-foreground'}`}>
                                                {stock.stockQty}
                                              </span>
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex flex-col gap-0.5">
                                                <span className={`text-sm ${
                                                  isExpired(stock.expiry_date) 
                                                    ? 'text-destructive font-medium' 
                                                    : isExpiringSoon(stock.expiry_date)
                                                      ? 'text-warning font-medium'
                                                      : ''
                                                }`}>
                                                  {formatDate(stock.expiry_date)}
                                                </span>
                                                {isExpired(stock.expiry_date) && (
                                                  <Badge variant="destructive" className="text-xs w-fit">Expired</Badge>
                                                )}
                                                {!isExpired(stock.expiry_date) && isExpiringSoon(stock.expiry_date) && (
                                                  <Badge variant="outline" className="text-xs w-fit text-warning border-warning">Expiring Soon</Badge>
                                                )}
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              {getStockStatusBadge(stock.status)}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                                              {formatDate(stock.created_at)}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                                              {formatDate(stock.updated_at)}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                  
                                  {/* Mobile-only: Show dates below for small screens */}
                                  <div className="lg:hidden mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    <div>
                                      <span className="font-medium">Created:</span> {formatDate(group.batches[0].created_at)}
                                    </div>
                                    <div>
                                      <span className="font-medium">Updated:</span> {formatDate(group.batches[0].updated_at)}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-2 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} {hasMore ? `of many` : `(last page)`} - Showing {perPage} items per page
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!hasMore || isLoading}
                title={!hasMore ? "No more stocks to load" : "Load next page"}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Stock Dialog */}
      <AddStockDialog
        open={addStockDialog.open}
        onOpenChange={handleCloseAddStock}
        productId={addStockDialog.productId}
        productName={addStockDialog.productName}
        onSuccess={handleAddStockSuccess}
      />

      {/* Edit Stock Options Dialog */}
      <EditStockOptionsDialog
        open={editStockOptionsDialog.open}
        onOpenChange={handleCloseEditStockOptions}
        productId={editStockOptionsDialog.productId}
        productName={editStockOptionsDialog.productName}
        onChangeQuantity={handleChangeQuantity}
        onChangeDetails={handleChangeDetails}
      />

      {/* Change Stock Quantity Dialog */}
      <ChangeStockQuantityDialog
        open={changeQuantityDialog.open}
        onOpenChange={handleCloseChangeQuantity}
        productId={changeQuantityDialog.productId}
        productName={changeQuantityDialog.productName}
        batches={changeQuantityDialog.batches}
        onSuccess={handleEditSuccess}
      />

      {/* Change Stock Details Dialog */}
      <ChangeStockDetailsDialog
        open={changeDetailsDialog.open}
        onOpenChange={handleCloseChangeDetails}
        productId={changeDetailsDialog.productId}
        productName={changeDetailsDialog.productName}
        batches={changeDetailsDialog.batches}
        onSuccess={handleEditSuccess}
      />
      {/* Delete Stock Dialog */}
      <DeleteStockDialog
        open={deleteStockDialog.open}
        onOpenChange={handleCloseDeleteStock}
        productId={deleteStockDialog.productId}
        productName={deleteStockDialog.productName}
        batches={deleteStockDialog.batches}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
