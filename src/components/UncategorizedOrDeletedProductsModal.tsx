import React, { useState, useEffect } from 'react';
import { X, Package, Search, AlertCircle, Loader2 } from 'lucide-react';
import { CategoryService } from './category/services/category.service';
import { Product } from '../types/product';

interface UncategorizedOrDeletedProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  uncategorizedProducts: Product[];
}

const UncategorizedOrDeletedProductsModal: React.FC<UncategorizedOrDeletedProductsModalProps> = ({
  isOpen,
  onClose,
  uncategorizedProducts
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'uncategorized' | 'deleted'>('uncategorized');

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      fetchDeletedProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    updateFilteredProducts();
  }, [searchTerm, uncategorizedProducts, deletedProducts, activeTab]);

  const fetchDeletedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const products = await CategoryService.getAllDeletedProducts();
      setDeletedProducts(products);
    } catch (err) {
      console.error('Error fetching deleted products:', err);
      setError('Failed to load deleted products');
      setDeletedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFilteredProducts = () => {
    const sourceProducts = activeTab === 'uncategorized' ? uncategorizedProducts : deletedProducts;
    if (searchTerm.trim() === '') {
      setFilteredProducts(sourceProducts);
    } else {
      const filtered = sourceProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  if (!isOpen) return null;

  const activeProducts = activeTab === 'uncategorized' ? uncategorizedProducts : deletedProducts;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Uncategorized or Deleted Products
                  </h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {activeTab === 'uncategorized' ? (
                      `${uncategorizedProducts.length} ${uncategorizedProducts.length === 1 ? 'product' : 'products'} without category`
                    ) : (
                      `${deletedProducts.length} ${deletedProducts.length === 1 ? 'product' : 'products'} marked as deleted`
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('uncategorized')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'uncategorized'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Uncategorized ({uncategorizedProducts.length})
              </button>
              <button
                onClick={() => setActiveTab('deleted')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'deleted'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Deleted ({deletedProducts.length})
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Loading products...</p>
                </div>
              ) : error && activeTab === 'deleted' ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{error}</h3>
                  <button
                    onClick={fetchDeletedProducts}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  {searchTerm ? (
                    <>
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No products found
                      </h3>
                      <p className="text-gray-600">
                        Try adjusting your search terms
                      </p>
                    </>
                  ) : (
                    <>
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {activeTab === 'uncategorized' ? 'No uncategorized products' : 'No deleted products'}
                      </h3>
                      <p className="text-gray-600">
                        {activeTab === 'uncategorized'
                          ? 'All products have been categorized'
                          : 'There are no deleted products at this time'}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.productId}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                              {product.name}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              activeTab === 'uncategorized'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            } flex-shrink-0`}>
                              {activeTab === 'uncategorized' ? 'Uncategorized' : 'Deleted'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            ID: {product.productId}
                          </p>
                          {product.barcode && (
                            <p className="text-sm text-gray-600 mb-1">
                              Barcode: {product.barcode}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs text-gray-500">
                              Category: {product.categoryId}
                            </span>
                            <span className="text-xs text-gray-500">
                              Brand: {product.brandId}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col gap-3 sm:gap-2 items-start sm:items-end">
                          <div className="text-left sm:text-right">
                            <p className="text-xs text-gray-500">Cost Price</p>
                            <p className="text-sm font-medium text-gray-700">
                              Rs. {product.costPrice.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-xs text-gray-500">Selling Price</p>
                            <p className="text-base font-semibold text-gray-900">
                              Rs. {product.sellingPrice.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-xs text-gray-500">Stock</p>
                            <p className={`text-sm font-medium ${
                              product.stockQty > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {product.stockQty} units
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {!loading && !error && activeProducts.length > 0 && (
              <div className={`border-t border-gray-200 p-4 sm:p-6 ${
                activeTab === 'uncategorized' ? 'bg-blue-50' : 'bg-red-50'
              }`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 ${
                    activeTab === 'uncategorized' ? 'text-blue-600' : 'text-red-600'
                  } flex-shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <p className={`text-sm ${
                      activeTab === 'uncategorized' ? 'text-blue-900' : 'text-red-900'
                    }`}>
                      <strong>Note:</strong> {
                        activeTab === 'uncategorized'
                          ? 'These products have not been assigned to any category. Assign them to categories to better organize your inventory.'
                          : 'These products have been marked as deleted. They may need to be restored or permanently removed from the system.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UncategorizedOrDeletedProductsModal;