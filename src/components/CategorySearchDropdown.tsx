import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { CategoryService } from './category/services/category.service';
import { Category } from './category/models/category.model';

interface CategorySearchDropdownProps {
  onSelect: (category: Category) => void;
  placeholder?: string;
  className?: string;
}

/**
 * OPTIMIZED Category Search Dropdown
 * Uses the new /api/categories/search endpoint for efficient searching
 * Perfect for forms and dropdowns with 100+ categories
 */
export const CategorySearchDropdown: React.FC<CategorySearchDropdownProps> = ({
  onSelect,
  placeholder = 'Search categories...',
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search if empty or too short
    if (!searchTerm || searchTerm.length < 1) {
      setCategories([]);
      return;
    }

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await CategoryService.searchCategories({
          q: searchTerm,
          limit: 20
        });
        setCategories(results);
        setIsOpen(true);
      } catch (error) {
        console.error('Error searching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const handleSelect = (category: Category) => {
    setSelectedCategory(category);
    setSearchTerm(category.name);
    setIsOpen(false);
    onSelect(category);
  };

  const handleClear = () => {
    setSelectedCategory(null);
    setSearchTerm('');
    setCategories([]);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedCategory(null);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            if (categories.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : categories.length > 0 ? (
            <ul>
              {categories.map((category) => (
                <li key={category.categoryId}>
                  <button
                    onClick={() => handleSelect(category)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-900">{category.name}</span>
                    {category.product_count !== undefined && (
                      <span className="text-sm text-gray-500">
                        {category.product_count} products
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : searchTerm ? (
            <div className="px-4 py-3 text-center text-gray-500">
              No categories found
            </div>
          ) : null}
        </div>
      )}

      {/* Selected Category Display */}
      {selectedCategory && (
        <div className="mt-2 px-3 py-2 bg-blue-50 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            Selected: {selectedCategory.name}
          </span>
          <button
            onClick={handleClear}
            className="text-blue-600 hover:text-blue-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CategorySearchDropdown;
