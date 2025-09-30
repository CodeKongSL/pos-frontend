import React, { useState, useEffect } from 'react';
import { Folder, Tag, FolderOpen, Edit2, Trash2, Search } from 'lucide-react';

// Types
interface Category {
  categoryId: string;
  name: string;
  created_at: string;
  updated_at: string;
}

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
  productSubcategories: any[];
}

const API_BASE_URL = 'https://my-go-backend.onrender.com';

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, productsData] = await Promise.all([
        fetchCategories(),
        fetchProducts()
      ]);
      setCategories(categoriesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/FindAllCategory`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return await response.json();
  };

  const fetchProducts = async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/FindAllProducts`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  };

  const getProductCountByCategory = (categoryId: string) => {
    return products.filter(p => p.categoryId === categoryId).length;
  };

  const getCategorizedProductsCount = () => {
    return products.filter(p => p.categoryId && p.categoryId.trim() !== '').length;
  };

  const getUncategorizedProductsCount = () => {
    return products.filter(p => !p.categoryId || p.categoryId.trim() === '').length;
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewProducts = (categoryId: string, categoryName: string) => {
    setSelectedCategory(categoryId);
    // In a real app, this would navigate to a products page or open a modal
    alert(`Viewing products for category: ${categoryName}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Categories</h1>
          <p className="text-gray-600">Organize products into categories</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
                <p className="text-gray-600 mt-1">Total Categories</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Folder className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{getCategorizedProductsCount()}</p>
                <p className="text-gray-600 mt-1">Categorized Products</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{getUncategorizedProductsCount()}</p>
                <p className="text-gray-600 mt-1">Uncategorized</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => {
            const productCount = getProductCountByCategory(category.categoryId);
            
            return (
              <div
                key={category.categoryId}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <div className="flex gap-2">
                      <button
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    {category.categoryId}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {productCount} {productCount === 1 ? 'Product' : 'Products'}
                    </span>
                    <button
                      onClick={() => handleViewProducts(category.categoryId, category.name)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      View Products
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first category'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;