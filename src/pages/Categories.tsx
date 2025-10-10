import React, { useState, useEffect } from 'react';
import { Folder, Tag, FolderOpen, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CategoryProductsModal from '../components/CategoryProductsModal';
import DeletedProductsModal from '../components/DeletedProductsModal';

// Types
interface Category {
  categoryId: string;
  name: string;
  deleted: boolean;
  created_at: string;
  updated_at: string;
}

import { Product } from '../types/product';

const API_BASE_URL = 'https://my-go-backend.onrender.com';

import { CategoryService } from '../components/category/services/category.service';
import { CategoryPaginationResponse } from '../components/category/models/category.model';
import { ProductService } from '@/components/product/services/product.service';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryPagination, setCategoryPagination] = useState<CategoryPaginationResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryProductCounts, setCategoryProductCounts] = useState<Record<string, number>>({});
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, productsData, deletedProductsData] = await Promise.all([
        fetchCategories(),
        fetchAllProductsCount(),
        fetchDeletedProducts()
      ]);
      
      console.log('Fetched data:', {
        categoriesCount: categoriesData.data.length,
        productsCount: productsData,
        deletedProductsCount: deletedProductsData.length,
        pagination: {
          page: categoriesData.page,
          per_page: categoriesData.per_page,
          total: categoriesData.total,
          total_pages: categoriesData.total_pages
        }
      });
      
      setCategoryPagination(categoriesData);
      setCategories(categoriesData.data);
      setTotalProductsCount(productsData);
      setProducts([]);
      setDeletedProducts(deletedProductsData);
      
      // Fetch product counts for each category
      await fetchCategoryProductCounts(categoriesData.data);
      
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProductsCount = async (): Promise<number> => {
    try {
      let totalCount = 0;
      let hasMore = true;
      let cursor: string | null = null;

      // Fetch all products using pagination to count them
      while (hasMore) {
        const response = await ProductService.getAllProducts({
          per_page: 100,
          cursor: cursor || undefined
        });
        
        totalCount += response.data.filter(p => !p.deleted && p.categoryId && p.categoryId.trim() !== '').length;
        hasMore = response.has_more;
        cursor = response.next_cursor;
      }
      
      return totalCount;
    } catch (error) {
      console.error('Error fetching products count:', error);
      return 0;
    }
  };

  const fetchCategories = async (): Promise<CategoryPaginationResponse> => {
    return await CategoryService.getAllCategories({ 
      page: currentPage, 
      per_page: itemsPerPage 
    });
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

  const fetchCategoryProductCounts = async (categories: Category[]) => {
    try {
      const counts: Record<string, number> = {};
      
      // Fetch product count for each category
      await Promise.all(
        categories.map(async (category) => {
          try {
            const products = await CategoryService.getProductsByCategoryId(category.categoryId, 1000); // Large number to get all products
            counts[category.categoryId] = products.length;
          } catch (error) {
            console.error(`Error fetching products for category ${category.categoryId}:`, error);
            counts[category.categoryId] = 0;
          }
        })
      );
      
      setCategoryProductCounts(counts);
    } catch (error) {
      console.error('Error fetching category product counts:', error);
    }
  };

  const getProductCountByCategory = (categoryId: string) => {
    return categoryProductCounts[categoryId] || 0;
  };

  const getCategorizedProductsCount = () => {
    return totalProductsCount;
  };

  const getDeletedProductsCount = () => {
    return deletedProducts.length;
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewProducts = (categoryId: string, categoryName: string) => {
    setSelectedCategory({ id: categoryId, name: categoryName });
    setIsModalOpen(true);
  };

  const handleViewDeletedProducts = () => {
    setIsDeletedModalOpen(true);
  };

  const handleNavigateToProducts = () => {
    navigate('/products');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleCloseDeletedModal = () => {
    setIsDeletedModalOpen(false);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    // Check if category has products using the count from our state
    const productCount = getProductCountByCategory(categoryId);
    
    if (productCount > 0) {
      alert(
        `Cannot delete this category!\n\n` +
        `This category has ${productCount} product(s) assigned to it.\n\n` +
        `Please reassign or delete these products before deleting the category.`
      );
      return;
    }

    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await CategoryService.deleteCategory(categoryId);
        await fetchData();
        alert('Category deleted successfully!');
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
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
                <p className="text-3xl font-bold text-gray-900">{categoryPagination?.total || 0}</p>
                <p className="text-gray-600 mt-1">Total Categories</p>
                <p className="text-sm text-gray-500">Showing {categories.length} of {categoryPagination?.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Folder className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleNavigateToProducts}
          >
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
            onClick={handleViewDeletedProducts}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{getDeletedProductsCount()}</p>
                <p className="text-gray-600 mt-1">Deleted Products</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-red-600" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredCategories.map((category) => {
            const productCount = getProductCountByCategory(category.categoryId);
            
            return (
              <div
                key={category.categoryId}
                className="group bg-gradient-to-br from-white to-blue-50/30 rounded-xl shadow-sm border border-blue-100 hover:shadow-lg hover:border-blue-300 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header with colored accent */}
                <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-1.5 rounded-t-xl"></div>
                
                <div className="p-4">
                  {/* Category Icon and Actions */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                        <Folder className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-500 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{category.categoryId}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      <button
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Edit category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.categoryId)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-blue-100 my-3"></div>

                  {/* Footer with product count and action */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-medium text-gray-600">
                        {productCount} {productCount === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleViewProducts(category.categoryId, category.name)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-all hover:shadow-md active:scale-95 opacity-0 group-hover:opacity-100"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

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

        {/* Pagination Controls */}
        {categoryPagination && categoryPagination.total_pages > 1 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Items per page selector */}
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

              {/* Pagination info */}
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, categoryPagination.total)} of {categoryPagination.total} categories
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: categoryPagination.total_pages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages around current
                      return page === 1 || 
                             page === categoryPagination.total_pages || 
                             Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, visiblePages) => {
                      // Add ellipsis if there's a gap
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
                  disabled={currentPage === categoryPagination.total_pages}
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

      {/* Category Products Modal */}
      {selectedCategory && (
        <CategoryProductsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          categoryId={selectedCategory.id}
          categoryName={selectedCategory.name}
        />
      )}

      {/* Deleted Products Modal */}
      <DeletedProductsModal
        isOpen={isDeletedModalOpen}
        onClose={handleCloseDeletedModal}
        deletedProducts={deletedProducts}
        onProductRestored={fetchData}
      />
    </div>
  );
};

export default CategoriesPage;