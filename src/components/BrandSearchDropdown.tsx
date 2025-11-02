import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { BrandService } from './brand/services/brand.service';
import { Brand } from './brand/models/brand.model';

interface BrandSearchDropdownProps {
  onSelect: (brand: Brand) => void;
  placeholder?: string;
  className?: string;
  categoryId?: string; // Optional: filter by category
}

/**
 * OPTIMIZED Brand Search Dropdown
 * Uses the new /api/brands/search endpoint for efficient searching
 * Perfect for forms and dropdowns with 100+ brands
 */
export const BrandSearchDropdown: React.FC<BrandSearchDropdownProps> = ({
  onSelect,
  placeholder = 'Search brands...',
  className = '',
  categoryId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
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
      setBrands([]);
      return;
    }

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await BrandService.searchBrands({
          q: searchTerm,
          limit: 20
        });

        // Filter by category if provided
        const filteredResults = categoryId
          ? results.filter(brand => brand.categoryId === categoryId)
          : results;

        setBrands(filteredResults);
        setIsOpen(true);
      } catch (error) {
        console.error('Error searching brands:', error);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, categoryId]);

  const handleSelect = (brand: Brand) => {
    setSelectedBrand(brand);
    setSearchTerm(brand.name);
    setIsOpen(false);
    onSelect(brand);
  };

  const handleClear = () => {
    setSelectedBrand(null);
    setSearchTerm('');
    setBrands([]);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedBrand(null);
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
            if (brands.length > 0) setIsOpen(true);
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
          ) : brands.length > 0 ? (
            <ul>
              {brands.map((brand) => (
                <li key={brand.brandId}>
                  <button
                    onClick={() => handleSelect(brand)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-900">{brand.name}</span>
                    {brand.product_count !== undefined && (
                      <span className="text-sm text-gray-500">
                        {brand.product_count} products
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : searchTerm ? (
            <div className="px-4 py-3 text-center text-gray-500">
              {categoryId ? 'No brands found for this category' : 'No brands found'}
            </div>
          ) : null}
        </div>
      )}

      {/* Selected Brand Display */}
      {selectedBrand && (
        <div className="mt-2 px-3 py-2 bg-blue-50 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            Selected: {selectedBrand.name}
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

export default BrandSearchDropdown;
