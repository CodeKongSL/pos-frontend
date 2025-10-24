import { useState, useEffect } from "react";
import { Search, Package, AlertCircle, RefreshCcw, ChevronLeft, ChevronRight, X } from "lucide-react";
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
  const [isLoadingMetrics, setIsLoadingMetrics] = useState<boolean>(true);
  const [isLoadingTotalQty, setIsLoadingTotalQty] = useState<boolean>(true);
  const [isLoadingStatusCounts, setIsLoadingStatusCounts] = useState<boolean>(true);

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
    console.log('fetchStocks called with cursor:', cursor, 'resetPagination:', resetPagination, 'perPage:', perPage);
    
    try {
      // If resetPagination is true, don't use any cursor (start from beginning)
      const apiCursor = resetPagination ? undefined : (cursor || undefined);
      console.log('Using API cursor:', apiCursor);
      
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
      
      console.log('Stocks response:', data);
      console.log('Setting stocks count:', data.data.length);
      console.log('Pagination state - next_cursor:', data.next_cursor, 'has_more:', data.has_more);
      
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
        console.log('Reset pagination tracking');
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
    // Fetch stock status counts from dedicated endpoint
    fetchStockStatusCounts();
    
    // Always fetch total stock quantity from dedicated endpoint
    fetchTotalStockQuantity();
    
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
    console.log('Changing per page from', perPage, 'to', newPerPage);
    setPerPage(newPerPage);
    // Reset to first page when changing per page
    console.log('Resetting pagination to first page');
    
    // Manually call the API with the new perPage value
    setIsLoading(true);
    setError(null);
    console.log('fetchData called with new perPage:', newPerPage, 'resetPagination: true');
    
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
      
      console.log('Stocks response:', data);
      console.log('Setting stocks count:', data.data.length);
      console.log('Pagination state - next_cursor:', data.next_cursor, 'has_more:', data.has_more);
      
      setStocks(data.data);
      setNextCursor(data.next_cursor || null);
      setHasMore(data.has_more);
      setCurrentCursor(null);
      setCursors([]);
      setCurrentPage(1);
      console.log('Reset pagination tracking');
      
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

  // Handle next page
  const handleNextPage = () => {
    if (hasMore && nextCursor) {
      console.log('Moving to next page, current cursor:', currentCursor, 'next cursor:', nextCursor);
      // Store current cursor for back navigation
      const newCursors = [...cursors];
      if (currentCursor !== null) {
        newCursors.push(currentCursor);
      }
      setCursors(newCursors);
      setCurrentPage(currentPage + 1);
      fetchStocks(nextCursor);
    }
  };

  // Handle previous page
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newCursors = [...cursors];
      const prevCursor = newCursors.pop();
      console.log('Moving to previous page, current page:', currentPage, 'prev cursor:', prevCursor);
      setCursors(newCursors);
      setCurrentPage(currentPage - 1);
      // If we're going back to page 1, use null cursor
      fetchStocks(currentPage === 2 ? null : prevCursor || null);
    }
  };

  // Fetch total stock quantity from dedicated endpoint
  const fetchTotalStockQuantity = async () => {
    setIsLoadingTotalQty(true);
    try {
      const totalQty = await StockService.getTotalStockQuantity();
      setTotalStockQty(totalQty);
    } catch (error) {
      console.error('Error fetching total stock quantity:', error);
      // Don't update error state here, as this is a background fetch
    } finally {
      setIsLoadingTotalQty(false);
    }
  };

  // Fetch stock status counts from dedicated endpoint
  const fetchStockStatusCounts = async () => {
    setIsLoadingStatusCounts(true);
    try {
      const counts = await StockService.getStockStatusCounts();
      setTotalItems(counts.total);
      setLowStockCount(counts.lowStock);
      setAverageStockCount(counts.averageStock);
    } catch (error) {
      console.error('Error fetching stock status counts:', error);
      // Don't update error state here, as this is a background fetch
    } finally {
      setIsLoadingStatusCounts(false);
    }
  };

  // Handle refresh (including metrics)
  const handleRefresh = () => {
    fetchStocks(currentCursor);
  };

  // Handle metrics refresh
  const handleRefreshMetrics = () => {
    fetchStockStatusCounts();
    fetchTotalStockQuantity();
  };

  // Handle status filter click
  const handleStatusFilterClick = (filter: 'all' | 'low' | 'average') => {
    if (statusFilter === filter) {
      // If clicking the same filter, reset to 'all'
      setStatusFilter('all');
    } else {
      setStatusFilter(filter);
    }
  };

  const filteredStocks = stocks.filter(stock =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.productId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatusBadge = (status: string) => {
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
  };

  const formatDate = (dateString: string) => {
    return StockService.formatDate(dateString);
  };

  const isExpiringSoon = (expiryDate: string) => {
    return StockService.isExpiringSoon(expiryDate);
  };

  const isExpired = (expiryDate: string) => {
    return StockService.isExpired(expiryDate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Management</h1>
          <p className="text-muted-foreground mt-1">View and monitor your inventory stock levels</p>
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
            ({filteredStocks.length} on this page)
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product ID</TableHead>
                <TableHead>Batch ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Stock Quantity</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-sm text-muted-foreground">Loading stocks...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredStocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
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
                filteredStocks.map((stock) => (
                  <TableRow key={stock.id}>
                    <TableCell className="font-medium">{stock.productId}</TableCell>
                    <TableCell>
                      {stock.batchId ? (
                        <Badge variant="outline" className="text-xs">
                          {stock.batchId}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">No batch</span>
                      )}
                    </TableCell>
                    <TableCell>{stock.name}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${stock.stockQty < 10 ? 'text-warning' : 'text-foreground'}`}>
                        {stock.stockQty}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={
                          isExpired(stock.expiry_date) 
                            ? 'text-destructive font-medium' 
                            : isExpiringSoon(stock.expiry_date)
                              ? 'text-warning font-medium'
                              : ''
                        }>
                          {formatDate(stock.expiry_date)}
                        </span>
                        {isExpired(stock.expiry_date) && (
                          <span className="text-xs text-destructive">Expired</span>
                        )}
                        {!isExpired(stock.expiry_date) && isExpiringSoon(stock.expiry_date) && (
                          <span className="text-xs text-warning">Expiring Soon</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStockStatusBadge(stock.status)}</TableCell>
                    <TableCell>{formatDate(stock.created_at)}</TableCell>
                    <TableCell>{formatDate(stock.updated_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
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
    </div>
  );
}
