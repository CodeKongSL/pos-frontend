// Emergency fallback service for when the main API fails
export const FallbackProductService = {
  getAllProducts: async (): Promise<import('../models/product.model').PaginatedProductResponse> => {
    console.warn('🚨 Using fallback product service - main API failed');
    return {
      data: [],
      per_page: 15,
      next_cursor: null,
      has_more: false
    };
  }
};