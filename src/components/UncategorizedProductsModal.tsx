import React, { useState, useEffect } from 'react';
import { X, Package, Search } from 'lucide-react';

interface Product {
  productId: string;
  name: string;
  barcode?: string;
  categoryId: string;
  brandId: string;
  subcategoryId?: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  stockQty: number;
  created_at: string;
  updated_at: string;
}

interface UncategorizedProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = 'https://my-go-backend.onrender.com';

const UncategorizedProductsModal: React.FC<UncategorizedProductsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUncategorizedProducts();
    }
  }, [isOpen]);

  const fetchUncategorizedProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/FindAllProducts`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      
      // Filter for uncategorized products
      const uncategorized = data.filter((p: Product) => 
        !p.categoryId || p.categoryId.trim() === '' || p.categoryId === 'UNCATEGORIZED'
      );
      
      setProducts(uncategorized);
    } catch (error) {
      console.error('Error fetching uncategorized products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Uncategorized Products</h2>
            <p className="text-sm text-gray-600 mt-1">
              {products.length} {products.length === 1 ? 'product' : 'products'} without a category
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No products found' : 'No uncategorized products'}
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'All products are organized into categories'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.productId}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        {product.barcode && (
                          <span className="text-gray-600">
                            <span className="font-medium">Barcode:</span> {product.barcode}
                          </span>
                        )}
                        <span className="text-gray-600">
                          <span className="font-medium">Stock:</span> {product.stockQty}
                        </span>
                        <span className="text-gray-600">
                          <span className="font-medium">Price:</span> Rs. {product.sellingPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Uncategorized
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UncategorizedProductsModal;