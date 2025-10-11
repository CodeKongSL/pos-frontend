import { useState, useEffect } from "react";
import { X, Search, AlertCircle, ChevronRight } from "lucide-react";
import { BrandService } from "../components/brand/services/brand.service";
import { Product } from "../components/brand/models/brand.model";

interface BrandProductsModalProps {
  brandId: string;
  brandName: string;
  onClose: () => void;
}

export default function BrandProductsModal({ brandId, brandName, onClose }: BrandProductsModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (brandId) {
      setCurrentPage(1);
      setProducts([]);
      setTotalProducts(0);
      setHasMore(false);
      fetchProducts();
    }
  }, [brandId]);

  useEffect(() => {
    if (brandId && currentPage > 1) {
      fetchProducts();
    }
  }, [currentPage, itemsPerPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await BrandService.getProductsByBrandId(brandId, itemsPerPage);
      
      if (currentPage === 1) {
        setProducts(data);
      } else {
        setProducts(prev => [...prev, ...data]);
      }
      
      setTotalProducts(data.length);
      setHasMore(data.length === itemsPerPage); // Assume there's more if we got exactly what we asked for
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleItemsPerPageChange = async (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    setProducts([]);
    setTotalProducts(0);
    setHasMore(false);
    
    // Fetch products with new items per page
    try {
      setLoading(true);
      setError(null);
      
      const data = await BrandService.getProductsByBrandId(brandId, newItemsPerPage);
      
      setProducts(data);
      setTotalProducts(data.length);
      setHasMore(data.length === newItemsPerPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (qty: number) => {
    if (qty > 10) return { color: 'text-green-600 bg-green-50', label: 'In Stock' };
    if (qty > 0) return { color: 'text-yellow-600 bg-yellow-50', label: 'Low Stock' };
    return { color: 'text-red-600 bg-red-50', label: 'Out of Stock' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{brandName}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              {searchTerm && ` matching "${searchTerm}"`}
              {hasMore && !searchTerm && <span className="text-blue-600 ml-1">(more available)</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Controls */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, ID, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300">
              <span className="text-sm text-gray-600 font-medium">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="border-0 text-sm font-medium text-gray-900 focus:ring-0 outline-none bg-transparent cursor-pointer"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto">
          {loading && currentPage === 1 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No products found' : 'No products for this brand'}
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'Add products to this brand to see them here'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Product Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Product ID
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Cost Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Selling Price
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product, index) => {
                    const stockStatus = getStockStatus(product.stockQty);
                    return (
                      <tr 
                        key={product.productId} 
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">
                              {product.name}
                            </span>
                            {product.barcode && (
                              <span className="text-xs text-gray-500 mt-1">
                                Barcode: {product.barcode}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 font-mono">
                            {product.productId}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-medium text-gray-900">
                            Rs. {(product.costPrice ?? 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            Rs. {(product.sellingPrice ?? 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${stockStatus.color}`}>
                              {product.stockQty} units
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer with Pagination */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium text-gray-900">{filteredProducts.length}</span> products
            </div>
            
            {hasMore && !searchTerm && (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Products</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}