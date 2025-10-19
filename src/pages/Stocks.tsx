import { useState, useEffect } from "react";
import { Search, Package, AlertCircle, RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";
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

interface Stock {
  id: string;
  productId: string;
  name: string;
  stockQty: number;
  expiry_date: string;
  created_at: string;
  updated_at: string;
}

interface PaginatedStockResponse {
  data: Stock[];
  next_cursor?: string;
  has_more: boolean;
}

export default function Stocks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    
    try {
      const params = new URLSearchParams({
        per_page: perPage.toString(),
      });
      
      if (!resetPagination && cursor) {
        params.append('cursor', cursor);
      }
      
      const response = await fetch(`https://my-go-backend.onrender.com/FindAllStocksLite?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stocks');
      }
      
      const data: PaginatedStockResponse = await response.json();
      
      // Validate response structure
      if (!data || !Array.isArray(data.data)) {
        throw new Error('Invalid response structure');
      }
      
      setStocks(data.data);
      setNextCursor(data.next_cursor || null);
      setHasMore(data.has_more);
      
      if (!resetPagination) {
        setCurrentCursor(cursor || null);
      } else {
        setCurrentCursor(null);
      }
      
      if (resetPagination) {
        setCursors([]);
        setCurrentPage(1);
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

  useEffect(() => {
    fetchStocks(null, true);
  }, []);

  // Handle per page change
  const handlePerPageChange = async (value: string) => {
    const newPerPage = parseInt(value);
    setPerPage(newPerPage);
    
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        per_page: newPerPage.toString(),
      });
      
      const response = await fetch(`https://my-go-backend.onrender.com/FindAllStocksLite?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stocks');
      }
      
      const data: PaginatedStockResponse = await response.json();
      
      if (!data || !Array.isArray(data.data)) {
        throw new Error('Invalid response structure');
      }
      
      setStocks(data.data);
      setNextCursor(data.next_cursor || null);
      setHasMore(data.has_more);
      setCurrentCursor(null);
      setCursors([]);
      setCurrentPage(1);
      
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
      setCursors(newCursors);
      setCurrentPage(currentPage - 1);
      fetchStocks(currentPage === 2 ? null : prevCursor || null);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchStocks(currentCursor);
  };

  const filteredStocks = stocks.filter(stock =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.productId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatusBadge = (stockQty: number) => {
    if (stockQty === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stockQty < 10) return <Badge variant="outline" className="text-warning border-warning">Low Stock</Badge>;
    if (stockQty < 50) return <Badge className="bg-blue-500 text-white">Medium Stock</Badge>;
    return <Badge className="bg-success text-success-foreground">Good Stock</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  const totalStockQty = stocks.reduce((sum, stock) => sum + stock.stockQty, 0);
  const lowStockCount = stocks.filter(stock => stock.stockQty < 10 && stock.stockQty > 0).length;
  const outOfStockCount = stocks.filter(stock => stock.stockQty === 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Management</h1>
          <p className="text-muted-foreground mt-1">View and monitor your inventory stock levels</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{stocks.length}</p>
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
                <p className="text-2xl font-bold text-success">{totalStockQty}</p>
                <p className="text-sm text-muted-foreground">Total Quantity</p>
              </div>
              <Package className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-warning">{lowStockCount}</p>
                <p className="text-sm text-muted-foreground">Low Stock</p>
              </div>
              <AlertCircle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-destructive">{outOfStockCount}</p>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>

      {/* Stocks Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Available Stocks ({filteredStocks.length} on this page)
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
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-sm text-muted-foreground">Loading stocks...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredStocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
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
                    <TableCell>{getStockStatusBadge(stock.stockQty)}</TableCell>
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
