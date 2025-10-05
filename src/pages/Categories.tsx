import React, { useState, useEffect } from 'react';
import { Folder, Tag, FolderOpen, Edit2, Trash2, Search } from 'lucide-react';
import CategoryProductsModal from '../components/CategoryProductsModal';
import UncategorizedOrDeletedProductsModal from '../components/UncategorizedOrDeletedProductsModal';

// Types
interface Category {
  categoryId: string;
  name: string;
  created_at: string;
  updated_at: string;
}

import { Product } from '../types/product';

const API_BASE_URL = 'https://my-go-backend.onrender.com';

import { CategoryService } from '../components/category/services/category.service';

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isUncategorizedModalOpen, setIsUncategorizedModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, productsData, deletedProductsData] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
        fetchDeletedProducts()
      ]);
      setCategories(categoriesData);
      setProducts(productsData);
      setDeletedProducts(deletedProductsData);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/FindAllCategory`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  };

  const fetchProducts = async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/FindAllProducts`);
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  };

  const fetchDeletedProducts = async (): Promise<Product[]> => {
    try {
      const products = await CategoryService.getAllDeletedProducts();
      return products;
    } catch (error) {
      console.error('Error fetching deleted products:', error);
      return [];
    }
  };

  const getProductCountByCategory = (categoryId: string) => {
    return products.filter(p => p.categoryId === categoryId).length;
  };

  const getCategorizedProductsCount = () => {
    return products.filter(p => 
      p.categoryId && 
      p.categoryId.trim() !== '' && 
      categories.some(c => c.categoryId === p.categoryId)
    ).length;
  };

  const getUncategorizedProducts = () => {
    return products.filter(p => 
      !p.categoryId || 
      p.categoryId.trim() === '' ||
      !categories.some(c => c.categoryId === p.categoryId)
    );
  };

  const getUncategorizedProductsCount = () => {
    return getUncategorizedProducts().length;
  };

  const getDeletedProductsCount = () => {
    return deletedProducts.length;
  };

  const getCombinedCount = () => {
    return getUncategorizedProductsCount() + getDeletedProductsCount();
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewProducts = (categoryId: string, categoryName: string) => {
    setSelectedCategory({ id: categoryId, name: categoryName });
    setIsModalOpen(true);
  };

  const handleViewUncategorizedOrDeletedProducts = () => {
    setIsUncategorizedModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleCloseUncategorizedModal = () => {
    setIsUncategorizedModalOpen(false);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await CategoryService.deleteCategory(categoryId);
        await fetchData();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category. Please try again.');
      }
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{error}</h3>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
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

          <div 
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleViewUncategorizedOrDeletedProducts}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{getCombinedCount()}</p>
                <p className="text-gray-600 mt-1">Uncategorized/Deleted</p>
                <p className="text-xs text-gray-500 mt-1">
                  {getUncategorizedProductsCount()} uncategorized, {getDeletedProductsCount()} deleted
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-orange-600" />
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
                        onClick={() => handleDeleteCategory(category.categoryId)}
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

      {/* Category Products Modal */}
      {selectedCategory && (
        <CategoryProductsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          categoryId={selectedCategory.id}
          categoryName={selectedCategory.name}
        />
      )}

      {/* Uncategorized or Deleted Products Modal */}
      <UncategorizedOrDeletedProductsModal
        isOpen={isUncategorizedModalOpen}
        onClose={handleCloseUncategorizedModal}
        uncategorizedProducts={getUncategorizedProducts()}
        deletedProducts={deletedProducts}
        onProductRestored={fetchData}
      />
    </div>
  );
};

export default CategoriesPage;