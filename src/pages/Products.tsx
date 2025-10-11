import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, RefreshCcw, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Product, PaginatedProductResponse } from "@/components/product/models/product.model";
import { ProductService } from "@/components/product/services/product.service";
import { Category } from "@/components/category/models/category.model";
import { CategoryService } from "@/components/category/services/category.service";
import { Brand } from "@/components/brand/models/brand.model";
import { BrandService } from "@/components/brand/services/brand.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddProductDialog } from "@/components/AddProductDialog";
import { ProductDetailsDialog } from "@/components/ProductDetailsDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DisplayProduct {
  productId: string;
  name: string;
  totalStock: number;
  categoryName: string;
  brandName: string;
  sellingPrice: number;
}

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<DisplayProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Pagination state
  const [perPage, setPerPage] = useState<number>(15);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [cursors, setCursors] = useState<string[]>([]); // Track cursors for pagination navigation
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchData = async (cursor?: string | null, resetPagination = false) => {
    setIsLoading(true);
    setError(null);
    console.log('fetchData called with cursor:', cursor, 'resetPagination:', resetPagination, 'perPage:', perPage);
    try {
      // If resetPagination is true, don't use any cursor (start from beginning)
      const apiCursor = resetPagination ? undefined : (cursor || undefined);
      console.log('Using API cursor:', apiCursor);
      
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        ProductService.getAllProducts({ per_page: perPage, cursor: apiCursor }),
        CategoryService.getAllCategoriesForDropdown(),
        BrandService.getAllBrandsForDropdown()
      ]);
      
      console.log('Products response:', productsRes);
      console.log('Categories response:', categoriesRes);
      console.log('Brands response:', brandsRes);
      
      // Handle pagination response with additional validation
      if (!productsRes || typeof productsRes !== 'object') {
        throw new Error('Invalid products response structure');
      }
      
      const paginatedResponse = productsRes as PaginatedProductResponse;
      
      // Validate the response structure
      if (!paginatedResponse.data || !Array.isArray(paginatedResponse.data)) {
        console.warn('Products response does not contain valid data array, using empty array');
        paginatedResponse.data = [];
      }
      
      // Set the products state
      const newProducts = paginatedResponse.data;
      console.log('Setting products count:', newProducts.length);
      setProducts(newProducts);
      setNextCursor(paginatedResponse.next_cursor);
      setHasMore(paginatedResponse.has_more);
      console.log('Pagination state - next_cursor:', paginatedResponse.next_cursor, 'has_more:', paginatedResponse.has_more);
      
      // Only set current cursor if we're not resetting pagination
      if (!resetPagination) {
        setCurrentCursor(cursor);
      } else {
        setCurrentCursor(null);
      }
      
      // Reset pagination tracking if needed
      if (resetPagination) {
        setCursors([]);
        setCurrentPage(1);
        console.log('Reset pagination tracking');
      }
      
      // Validate and set categories/brands
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
      setBrands(Array.isArray(brandsRes) ? brandsRes : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      setError(errorMessage);
      
      // Set empty states to prevent further errors
      setProducts([]);
      setCategories([]);
      setBrands([]);
      setNextCursor(null);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered - initial load');
    fetchData(null, true);
  }, []); // Only run on mount

  // Handle per page change
  const handlePerPageChange = async (value: string) => {
    const newPerPage = parseInt(value);
    console.log('Changing per page from', perPage, 'to', newPerPage);
    setPerPage(newPerPage);
    // Reset to first page when changing per page
    console.log('Resetting pagination to first page');
    
    // Manually call fetchData with the new perPage value
    setIsLoading(true);
    setError(null);
    console.log('fetchData called with cursor:', null, 'resetPagination:', true, 'perPage:', newPerPage);
    try {
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        ProductService.getAllProducts({ per_page: newPerPage, cursor: undefined }),
        CategoryService.getAllCategoriesForDropdown(),
        BrandService.getAllBrandsForDropdown()
      ]);
      
      console.log('Products response:', productsRes);
      
      // Handle pagination response with validation
      if (!productsRes || typeof productsRes !== 'object') {
        throw new Error('Invalid products response structure');
      }
      
      const paginatedResponse = productsRes as PaginatedProductResponse;
      
      // Validate the response structure
      if (!paginatedResponse.data || !Array.isArray(paginatedResponse.data)) {
        console.warn('Products response does not contain valid data array, using empty array');
        paginatedResponse.data = [];
      }
      
      // Set the products state
      const newProducts = paginatedResponse.data;
      console.log('Setting products count:', newProducts.length);
      setProducts(newProducts);
      setNextCursor(paginatedResponse.next_cursor);
      setHasMore(paginatedResponse.has_more);
      console.log('Pagination state - next_cursor:', paginatedResponse.next_cursor, 'has_more:', paginatedResponse.has_more);
      
      setCurrentCursor(null);
      setCursors([]);
      setCurrentPage(1);
      console.log('Reset pagination tracking');
      
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
      setBrands(Array.isArray(brandsRes) ? brandsRes : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      setError(errorMessage);
      
      // Set empty states to prevent further errors
      setProducts([]);
      setCategories([]);
      setBrands([]);
      setNextCursor(null);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle next page
  const handleNextPage = () => {
    if (hasMore && nextCursor) {
      console.log('Moving to next page, current cursor:', currentCursor, 'next cursor:', nextCursor);
      // Store current cursor for back navigation
      const newCursors = [...cursors];
      if (currentCursor !== null) {
        newCursors.push(currentCursor);
      }
      setCursors(newCursors);
      setCurrentPage(currentPage + 1);
      fetchData(nextCursor);
    }
  };

  // Handle previous page
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newCursors = [...cursors];
      const prevCursor = newCursors.pop();
      console.log('Moving to previous page, current page:', currentPage, 'prev cursor:', prevCursor);
      setCursors(newCursors);
      setCurrentPage(currentPage - 1);
      // If we're going back to page 1, use null cursor
      fetchData(currentPage === 2 ? null : prevCursor || null);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchData(currentCursor);
  };

  const getProductDisplayData = (product: Product): DisplayProduct => {
    // Ensure we have arrays to work with
    const safeCategories = Array.isArray(categories) ? categories : [];
    const safeBrands = Array.isArray(brands) ? brands : [];
    
    const category = safeCategories.find(c => c.categoryId === product.categoryId);
    const brand = safeBrands.find(b => b.brandId === product.brandId);

    return {
      productId: product.productId,
      name: product.name,
      totalStock: product.stockQty,
      categoryName: category ? category.name : 'Uncategorized',
      brandName: brand?.name || 'Unknown Brand',
      sellingPrice: product.sellingPrice
    };
  };

  const filteredProducts = products
    .map(getProductDisplayData)
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brandName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getStatusBadge = (status: string, stock: number) => {
    if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock < 10) return <Badge variant="outline" className="text-warning border-warning">Low Stock</Badge>;
    return <Badge className="bg-success text-success-foreground">Active</Badge>;
  };

  const handleDeleteClick = (product: DisplayProduct) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await ProductService.deleteProduct(productToDelete.productId);
      
      // Refresh the current page
      await fetchData(currentCursor);
      
      // Close dialog and reset state
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetails = (productId: string) => {
    setSelectedProductId(productId);
    setDetailsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Products</h1>
          <p className="text-muted-foreground mt-1">Manage your inventory and product catalog</p>
        </div>
        <AddProductDialog>
          <Button className="bg-primary hover:bg-primary-hover">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </AddProductDialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, category, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Products ({filteredProducts.length} on this page)
            {currentPage > 1 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                - Page {currentPage}
              </span>
            )}
          </CardTitle>
          {error && (
            <div className="mt-2 p-3 text-sm rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={handleRefresh}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-sm text-muted-foreground">Loading products...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-lg font-medium text-foreground mb-1">
                        {currentPage === 1 ? "No Products Found" : "No More Products"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm 
                          ? "Try adjusting your search criteria"
                          : currentPage === 1 
                            ? "Get started by adding your first product"
                            : "You've reached the end of the product list"}
                      </p>
                      {currentPage > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrevPage}
                          className="mt-3"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Go back to previous page
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.brandName}</TableCell>
                    <TableCell>{product.categoryName}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${product.totalStock < 10 ? 'text-warning' : 'text-foreground'}`}>
                        {product.totalStock}
                      </span>
                    </TableCell>
                    <TableCell>Rs. {Number(product.sellingPrice).toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge("", product.totalStock)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(product.productId)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-2 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} {hasMore ? `of many` : `(last page)`} - Showing {perPage} items per page
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!hasMore || isLoading}
                title={!hasMore ? "No more products to load" : "Load next page"}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Bulk Import</p>
                <p className="text-sm text-muted-foreground">Import products from CSV</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-accent/10">
                <Eye className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium">Generate Barcodes</p>
                <p className="text-sm text-muted-foreground">Create product barcodes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-success/10">
                <Trash2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium">Export Data</p>
                <p className="text-sm text-muted-foreground">Download product list</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{productToDelete?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Product Details Dialog */}
      {selectedProductId && (
        <ProductDetailsDialog
          productId={selectedProductId}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}
    </div>
  );
}