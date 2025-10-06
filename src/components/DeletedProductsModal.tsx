import React, { useState, useEffect } from 'react';
import { X, Package, Search, AlertCircle, RotateCcw, Trash2 } from 'lucide-react';
import { Product } from '../types/product';
import { CategoryService } from './category/services/category.service';

interface DeletedProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletedProducts: Product[];
  onProductRestored?: () => void;
}

const DeletedProductsModal: React.FC<DeletedProductsModalProps> = ({
  isOpen,
  onClose,
  deletedProducts,
  onProductRestored
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [restoringProducts, setRestoringProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    updateFilteredProducts();
  }, [searchTerm, deletedProducts]);

  const updateFilteredProducts = () => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(deletedProducts);
    } else {
      const filtered = deletedProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const handleRestoreProduct = async (product: Product) => {
    // Validate required fields
    if (!product.categoryId || !product.brandId) {
      alert('Cannot restore product: Missing category or brand information. Please ensure the product has valid category and brand IDs.');
      return;
    }

    const restoreMessage = `Restore "${product.name}"?\n\n` +
      `Category ID: ${product.categoryId}\n` +
      `Brand ID: ${product.brandId}\n` +
      `Subcategory ID: ${product.subCategoryId || 'NONE'}`;

    if (!window.confirm(restoreMessage)) {
      return;
    }

    setRestoringProducts(prev => new Set(prev).add(product.productId));

    try {
      console.log('Restoring product with data:', {
        productId: product.productId,
        categoryId: product.categoryId,
        brandId: product.brandId,
        subCategoryId: product.subCategoryId || 'NONE'
      });

      await CategoryService.restoreProduct({
        productId: product.productId,
        categoryId: product.categoryId,
        brandId: product.brandId,
        subCategoryId: product.subCategoryId || 'NONE'
      });

      console.log('Product restored successfully, refreshing data...');
      
      // Notify parent to refresh data and wait for it to complete
      if (onProductRestored) {
        await onProductRestored();
      }

      // Give a moment for state to update
      await new Promise(resolve => setTimeout(resolve, 300));

      alert('Product restored successfully! The product is now active and visible in the Products page.');
    } catch (error) {
      console.error('Error restoring product:', error);
      alert(error instanceof Error ? error.message : 'Failed to restore product. Please try again.');
    } finally {
      setRestoringProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.productId);
        return newSet;
      });
    }
  };

  const handleDeletePermanently = async (product: Product) => {
    alert('Delete permanently feature will be implemented soon.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
          <div className="relative w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-semibold text-gray-900">
                    Deleted Products
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    {deletedProducts.length} {deletedProducts.length === 1 ? 'product' : 'products'}
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
              {filteredProducts.length === 0 ? (
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
                        No deleted products
                      </h3>
                      <p className="text-gray-600">
                        There are no deleted products at this time
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map((product) => {
                    const isRestoring = restoringProducts.has(product.productId);
                    
                    return (
                      <div
                        key={product.productId}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        <div className="flex flex-col gap-2 sm:gap-3">
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-3">
                            <div className="flex-1 w-full sm:min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                  {product.name}
                                </h3>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-red-100 text-red-800 flex-shrink-0">
                                  Deleted
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
                                  Category: {product.categoryId || 'None'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Brand: {product.brandId || 'None'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Subcategory: {!product.subCategoryId || product.subCategoryId === 'NONE' ? 'None' : product.subCategoryId}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-row justify-between sm:flex-col gap-2 sm:gap-2 items-start sm:items-end w-full sm:w-auto border-t sm:border-t-0 border-gray-200 pt-2 sm:pt-0 mt-2 sm:mt-0">
                              <div className="text-left">
                                <p className="text-xs text-gray-500">Cost Price</p>
                                <p className="text-sm font-medium text-gray-700">
                                  Rs. {product.costPrice.toLocaleString()}
                                </p>
                              </div>
                              <div className="text-left">
                                <p className="text-xs text-gray-500">Selling Price</p>
                                <p className="text-base font-semibold text-gray-900">
                                  Rs. {product.sellingPrice.toLocaleString()}
                                </p>
                              </div>
                              <div className="text-left">
                                <p className="text-xs text-gray-500">Stock</p>
                                <p className={`text-sm font-medium ${
                                  product.stockQty > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {product.stockQty} units
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-200">
                            <button
                              onClick={() => handleRestoreProduct(product)}
                              disabled={isRestoring}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium min-h-[44px] sm:min-h-0"
                            >
                              <RotateCcw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
                              {isRestoring ? 'Restoring...' : 'Restore'}
                            </button>
                            <button
                              onClick={() => handleDeletePermanently(product)}
                              disabled={isRestoring}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium min-h-[44px] sm:min-h-0"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Permanently
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {deletedProducts.length > 0 && (
              <div className="border-t border-gray-200 p-4 sm:p-6 bg-red-50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-900">
                      <strong>Note:</strong> These products have been marked as deleted. You can restore them to bring them back into your active inventory, or permanently remove them from the system.
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

export default DeletedProductsModal;