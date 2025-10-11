import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Award, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BrandService } from "../components/brand/services/brand.service";
import { Brand, BrandPaginationResponse } from "../components/brand/models/brand.model";
import BrandProductsModal from "../components/BrandProductsModal";

// Display brand interface for the UI
interface DisplayBrand {
  id: string;
  name: string;
  revenue: string;
  status: string;
}

export default function Brands() {
  const [searchTerm, setSearchTerm] = useState("");
  const [brands, setBrands] = useState<DisplayBrand[]>([]);
  const [brandPagination, setBrandPagination] = useState<BrandPaginationResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<{ id: string; name: string } | null>(null);
  const [totalBrandedProducts, setTotalBrandedProducts] = useState<number>(0);
  const [loadingBrandedProducts, setLoadingBrandedProducts] = useState(false);
  const [brandProductCounts, setBrandProductCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchBrands();
    fetchTotalBrandedProducts();
  }, [currentPage, itemsPerPage]);

  const fetchTotalBrandedProducts = async () => {
    try {
      setLoadingBrandedProducts(true);
      const count = await BrandService.getTotalBrandedProductsCount();
      setTotalBrandedProducts(count);
    } catch (err) {
      console.error('Error fetching branded products count:', err);
      // Don't show error to user for this, just keep count as 0
    } finally {
      setLoadingBrandedProducts(false);
    }
  };

  const fetchSingleBrandProductCount = async (brandId: string) => {
    try {
      setLoadingCounts(prev => ({ ...prev, [brandId]: true }));
      
      // Fetch all products for this brand using pagination to get accurate count
      let totalCount = 0;
      let hasMore = true;
      let cursor: string | null = null;

      while (hasMore) {
        // Make direct API call with proper cursor handling
        const API_BASE_URL = 'https://my-go-backend.onrender.com';
        const FIND_PRODUCTS_BY_BRAND_URL = `${API_BASE_URL}/FindProductsByBrandId`;
        
        const queryParams = new URLSearchParams();
        queryParams.append('brandId', brandId);
        queryParams.append('per_page', '50'); // Use 50 per page for efficiency
        
        if (cursor && cursor.trim() !== '') {
          queryParams.append('cursor', cursor);
        }
        
        const url = `${FIND_PRODUCTS_BY_BRAND_URL}?${queryParams.toString()}`;
        console.log('Fetching products for count:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch products for counting');
        }
        
        const data = await response.json();
        
        // Handle response data safely
        let products: any[] = [];
        if (data && typeof data === 'object' && Array.isArray(data.data)) {
          products = data.data;
        } else if (Array.isArray(data)) {
          products = data;
        }
        
        // Count non-deleted products in this page
        const activeProducts = products.filter(product => product && !product.deleted);
        totalCount += activeProducts.length;
        
        hasMore = data.has_more || false;
        cursor = data.next_cursor || null;
        
        console.log(`Brand ${brandId} - Page processed: Found ${activeProducts.length} products. Total so far: ${totalCount}`);
        
        // Safety limit to prevent infinite loops
        if (totalCount > 10000) {
          console.warn(`Brand ${brandId} has more than 10,000 products, stopping count at ${totalCount}`);
          break;
        }
      }
      
      setBrandProductCounts(prev => ({ ...prev, [brandId]: totalCount }));
      return totalCount;
    } catch (error) {
      console.error(`Error fetching products for brand ${brandId}:`, error);
      setBrandProductCounts(prev => ({ ...prev, [brandId]: 0 }));
      return 0;
    } finally {
      setLoadingCounts(prev => ({ ...prev, [brandId]: false }));
    }
  };

  const getProductCountByBrand = (brandId: string) => {
    return brandProductCounts[brandId];
  };

  const handleBrandHover = async (brandId: string) => {
    // Only fetch if we don't already have the count
    if (brandProductCounts[brandId] === undefined) {
      await fetchSingleBrandProductCount(brandId);
    }
  };

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await BrandService.getAllBrands({
        page: currentPage,
        per_page: itemsPerPage
      });
      
      console.log('Fetched brands data:', {
        brandsCount: response.data.length,
        pagination: {
          page: response.page,
          per_page: response.per_page,
          total: response.total,
          total_pages: response.total_pages
        }
      });
      
      setBrandPagination(response);
      
      // Convert brands to display format without fetching product counts
      const displayBrands = response.data
        .filter(brand => !brand.deleted)
        .map((brand) => ({
          id: brand.brandId,
          name: brand.name,
          revenue: "Rs. 0.00", // Keep as placeholder
          status: "Active"
        }));
      
      setBrands(displayBrands);
      
      // Remove bulk product count fetching for performance
      // Product counts will be loaded on demand when user hovers over specific brands
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (brandId: string, brandName: string) => {
    // Check if brand has products using the count from our state
    let productCount = getProductCountByBrand(brandId);
    
    // If we don't have the count yet, fetch it before proceeding with deletion
    if (productCount === undefined) {
      productCount = await fetchSingleBrandProductCount(brandId);
    }
    
    if (productCount > 0) {
      alert(
        `Cannot delete this brand!\n\n` +
        `This brand has ${productCount} product(s) assigned to it.\n\n` +
        `Please reassign or delete these products before deleting the brand.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete "${brandName}"?`)) {
      return;
    }

    try {
      await BrandService.deleteBrand(brandId);
      alert('Brand deleted successfully!');
      // Refresh the brands list after successful deletion
      await fetchBrands();
    } catch (err) {
      alert('Error deleting brand: ' + (err instanceof Error ? err.message : 'An error occurred'));
      console.error('Error deleting brand:', err);
    }
  };

  const handleViewProducts = (brandId: string, brandName: string) => {
    setSelectedBrand({ id: brandId, name: brandName });
  };

  const handleCloseModal = () => {
    setSelectedBrand(null);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading brands...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Error: {error}</h3>
          <Button onClick={fetchBrands} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Brands</h1>
          <p className="text-muted-foreground mt-1">Manage product brands and manufacturers</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{brandPagination?.total || 0}</p>
                <p className="text-sm text-muted-foreground">Total Brands</p>
                <p className="text-xs text-muted-foreground/80">Showing {brands.length} of {brandPagination?.total || 0}</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-accent">
                  {loadingBrandedProducts ? (
                    <span className="inline-flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent"></div>
                      Loading...
                    </span>
                  ) : (
                    totalBrandedProducts.toLocaleString()
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Branded Products</p>
                <p className="text-xs text-muted-foreground/80">Products with assigned brands</p>
              </div>
              <Package className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">Rs. 113,750</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
              <Award className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Brands Grid */}
      {filteredBrands.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {searchTerm ? 'No brands found matching your search.' : 'No brands available.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBrands.map((brand) => {
            const productCount = getProductCountByBrand(brand.id);
            const isLoadingCount = loadingCounts[brand.id];
            const hasCount = productCount !== undefined;
            
            return (
              <Card 
                key={brand.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onMouseEnter={() => handleBrandHover(brand.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{brand.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBrand(brand.id, brand.name);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Products</p>
                      <p className="font-semibold">
                        {isLoadingCount ? (
                          <span className="inline-flex items-center gap-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-muted-foreground"></div>
                            Loading...
                          </span>
                        ) : hasCount ? (
                          productCount
                        ) : (
                          'Hover to load count'
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <p className="font-semibold text-accent">{brand.revenue}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-success text-success-foreground">
                      {brand.status}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProducts(brand.id, brand.name);
                      }}
                    >
                      View Products
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Brand Performance</p>
                  <p className="text-sm text-muted-foreground">View detailed brand analytics</p>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-accent/10">
                  <Package className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Brand Report</p>
                  <p className="text-sm text-muted-foreground">Generate brand-wise sales report</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {brandPagination && brandPagination.total_pages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Items per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="border border-input rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none bg-background"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Pagination info */}
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, brandPagination.total)} of {brandPagination.total} brands
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: brandPagination.total_pages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages around current
                      return page === 1 || 
                             page === brandPagination.total_pages || 
                             Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, visiblePages) => {
                      // Add ellipsis if there's a gap
                      const showEllipsisBefore = index > 0 && page > visiblePages[index - 1] + 1;
                      
                      return (
                        <React.Fragment key={page}>
                          {showEllipsisBefore && (
                            <span className="px-3 py-2 text-sm text-muted-foreground">...</span>
                          )}
                          <Button
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="min-w-[40px]"
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === brandPagination.total_pages}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Modal */}
      {selectedBrand && (
        <BrandProductsModal
          brandId={selectedBrand.id}
          brandName={selectedBrand.name}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}