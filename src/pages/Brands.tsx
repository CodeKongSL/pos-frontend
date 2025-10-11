import React, { useState, useEffect } from "react";
import { Search, Edit, Trash2, Award, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandService } from "../components/brand/services/brand.service";
import { Brand, BrandPaginationResponse, BrandCostSummary, DisplayBrand, TotalCostSummary } from "../components/brand/models/brand.model";
import BrandProductsModal from "../components/BrandProductsModal";

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
  const [brandCostSummaries, setBrandCostSummaries] = useState<Record<string, BrandCostSummary>>({});
  const [loadingCostSummaries, setLoadingCostSummaries] = useState<Record<string, boolean>>({});
  const [totalCostSummary, setTotalCostSummary] = useState<TotalCostSummary | null>(null);
  const [loadingTotalCostSummary, setLoadingTotalCostSummary] = useState(false);

  useEffect(() => {
    fetchBrands();
    fetchTotalBrandedProducts();
    fetchTotalCostSummary();
  }, [currentPage, itemsPerPage]);

  const fetchTotalCostSummary = async () => {
    try {
      setLoadingTotalCostSummary(true);
      const summary = await BrandService.getTotalCostSummary();
      setTotalCostSummary(summary);
    } catch (err) {
      console.error('Error fetching total cost summary:', err);
    } finally {
      setLoadingTotalCostSummary(false);
    }
  };

  const fetchTotalBrandedProducts = async () => {
    try {
      setLoadingBrandedProducts(true);
      const count = await BrandService.getTotalBrandedProductsCount();
      setTotalBrandedProducts(count);
    } catch (err) {
      console.error('Error fetching branded products count:', err);
    } finally {
      setLoadingBrandedProducts(false);
    }
  };

  const fetchSingleBrandProductCount = async (brandId: string) => {
    try {
      setLoadingCounts(prev => ({ ...prev, [brandId]: true }));
      
      let totalCount = 0;
      let hasMore = true;
      let cursor: string | null = null;

      while (hasMore) {
        const API_BASE_URL = 'https://my-go-backend.onrender.com';
        const FIND_PRODUCTS_BY_BRAND_URL = `${API_BASE_URL}/FindProductsByBrandId`;
        
        const queryParams = new URLSearchParams();
        queryParams.append('brandId', brandId);
        queryParams.append('per_page', '50');
        
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
        
        let products: any[] = [];
        if (data && typeof data === 'object' && Array.isArray(data.data)) {
          products = data.data;
        } else if (Array.isArray(data)) {
          products = data;
        }
        
        const activeProducts = products.filter(product => product && !product.deleted);
        totalCount += activeProducts.length;
        
        hasMore = data.has_more || false;
        cursor = data.next_cursor || null;
        
        console.log(`Brand ${brandId} - Page processed: Found ${activeProducts.length} products. Total so far: ${totalCount}`);
        
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

  const fetchSingleBrandCostSummary = async (brandId: string) => {
    try {
      setLoadingCostSummaries(prev => ({ ...prev, [brandId]: true }));
      const costSummary = await BrandService.getBrandCostSummary(brandId);
      setBrandCostSummaries(prev => ({ ...prev, [brandId]: costSummary }));
      return costSummary;
    } catch (error) {
      console.error(`Error fetching cost summary for brand ${brandId}:`, error);
      // Set default values if fetch fails
      const defaultSummary: BrandCostSummary = {
        brand_id: brandId,
        sales_target: 0,
        target_profit: 0,
        total_spend: 0
      };
      setBrandCostSummaries(prev => ({ ...prev, [brandId]: defaultSummary }));
      return defaultSummary;
    } finally {
      setLoadingCostSummaries(prev => ({ ...prev, [brandId]: false }));
    }
  };

  const getBrandCostSummary = (brandId: string) => {
    return brandCostSummaries[brandId];
  };

  const handleBrandHover = async (brandId: string) => {
    if (brandProductCounts[brandId] === undefined) {
      await fetchSingleBrandProductCount(brandId);
    }
    if (brandCostSummaries[brandId] === undefined) {
      await fetchSingleBrandCostSummary(brandId);
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
      
      const displayBrands = response.data
        .filter(brand => !brand.deleted)
        .map((brand) => ({
          id: brand.brandId,
          name: brand.name,
          expectedProfit: "Rs. 0.00",
          totalCost: "Rs. 0.00",
          totalSales: "Rs. 0.00"
        }));
      
      setBrands(displayBrands);
      
      // Note: Cost summaries are now loaded on-demand when hovering over brands
      // to improve page load performance
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (brandId: string, brandName: string) => {
    let productCount = getProductCountByBrand(brandId);
    
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
    setCurrentPage(1);
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading brands...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error: {error}</h3>
          <Button onClick={fetchBrands} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Brands</h1>
          <p className="text-gray-600">Manage product brands and manufacturers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{brandPagination?.total || 0}</p>
                <p className="text-gray-600 mt-1">Total Brands</p>
                <p className="text-sm text-gray-500">Showing {brands.length} of {brandPagination?.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingBrandedProducts ? (
                    <span className="inline-flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                      <span className="text-xl">Loading...</span>
                    </span>
                  ) : (
                    totalBrandedProducts.toLocaleString()
                  )}
                </p>
                <p className="text-gray-600 mt-1">Branded Products</p>
                <p className="text-sm text-gray-500">Products with assigned brands</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingTotalCostSummary ? (
                    <span className="inline-flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                      <span className="text-xl">Loading...</span>
                    </span>
                  ) : (
                    `Rs. ${totalCostSummary ? totalCostSummary.target_profit.toLocaleString() : '0'}`
                  )}
                </p>
                <p className="text-gray-600 mt-1">Expected Profit</p>
                <p className="text-xs text-gray-500 mt-1">
                  From current stocks
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Brands Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Brand Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Brand ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Expected Profit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total Cost
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total Sales
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBrands.map((brand) => {
                  const productCount = getProductCountByBrand(brand.id);
                  const isLoadingCount = loadingCounts[brand.id];
                  const hasCount = productCount !== undefined;
                  
                  return (
                    <tr 
                      key={brand.id}
                      className="hover:bg-blue-50/50 transition-colors"
                      onMouseEnter={() => handleBrandHover(brand.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Award className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{brand.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{brand.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {isLoadingCount ? (
                              <span className="inline-flex items-center gap-1">
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                                Loading...
                              </span>
                            ) : hasCount ? (
                              `${productCount} ${productCount === 1 ? 'item' : 'items'}`
                            ) : (
                              <span className="text-gray-400">Hover to load</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const costSummary = getBrandCostSummary(brand.id);
                          const isLoadingSummary = loadingCostSummaries[brand.id];
                          const hasCostSummary = costSummary !== undefined;
                          
                          if (isLoadingSummary) {
                            return (
                              <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                                Loading...
                              </span>
                            );
                          }
                          
                          return (
                            <span className="text-sm font-medium text-green-600">
                              {hasCostSummary ? (
                                `Rs. ${costSummary.target_profit.toLocaleString()}`
                              ) : (
                                <span className="text-gray-400">Hover to load</span>
                              )}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const costSummary = getBrandCostSummary(brand.id);
                          const isLoadingSummary = loadingCostSummaries[brand.id];
                          const hasCostSummary = costSummary !== undefined;
                          
                          if (isLoadingSummary) {
                            return (
                              <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                                Loading...
                              </span>
                            );
                          }
                          
                          return (
                            <span className="text-sm font-medium text-red-600">
                              {hasCostSummary ? (
                                `Rs. ${costSummary.total_spend.toLocaleString()}`
                              ) : (
                                <span className="text-gray-400">Hover to load</span>
                              )}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const costSummary = getBrandCostSummary(brand.id);
                          const isLoadingSummary = loadingCostSummaries[brand.id];
                          const hasCostSummary = costSummary !== undefined;
                          
                          if (isLoadingSummary) {
                            return (
                              <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                                Loading...
                              </span>
                            );
                          }
                          
                          return (
                            <span className="text-sm font-medium text-blue-600">
                              {hasCostSummary ? (
                                `Rs. ${costSummary.sales_target.toLocaleString()}`
                              ) : (
                                <span className="text-gray-400">Hover to load</span>
                              )}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewProducts(brand.id, brand.name)}
                            className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            View Products
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit brand"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBrand(brand.id, brand.name)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete brand"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredBrands.length === 0 && (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No brands found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first brand'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        {brandPagination && brandPagination.total_pages > 1 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Items per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, brandPagination.total)} of {brandPagination.total} brands
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: brandPagination.total_pages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 || 
                             page === brandPagination.total_pages || 
                             Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, visiblePages) => {
                      const showEllipsisBefore = index > 0 && page > visiblePages[index - 1] + 1;
                      
                      return (
                        <React.Fragment key={page}>
                          {showEllipsisBefore && (
                            <span className="px-3 py-2 text-sm text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              page === currentPage
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === brandPagination.total_pages}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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