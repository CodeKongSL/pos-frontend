import { useState, useEffect } from "react";
import { X, Package, DollarSign, Layers, Tag, Barcode, Calendar, Hash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "@/components/product/models/product.model";
import { ProductService } from "@/components/product/services/product.service";
import { Category } from "@/components/category/models/category.model";
import { CategoryService } from "@/components/category/services/category.service";
import { Brand } from "@/components/brand/models/brand.model";
import { BrandService } from "@/components/brand/services/brand.service";
import { Subcategory } from "@/components/subcategory/models/subcategory.model";
import { SubcategoryService } from "@/components/subcategory/services/subcategory.service";
import { Badge } from "@/components/ui/badge";

interface ProductDetailsDialogProps {
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailsDialog({ productId, open, onOpenChange }: ProductDetailsDialogProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && productId) {
      fetchProductDetails();
    }
  }, [open, productId]);

  const fetchProductDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const productData = await ProductService.getProductById(productId);
      setProduct(productData);

      // Fetch category, brand, and subcategory details
      const [categories, brands, subcategories] = await Promise.all([
        CategoryService.getAllCategories(),
        BrandService.getAllBrands(),
        SubcategoryService.getAllSubcategories()
      ]);

      console.log('Product subCategoryId:', productData.subCategoryId);
      console.log('Available subcategories:', subcategories);
      console.log('First subcategory structure:', subcategories[0]);

      const foundCategory = categories.find(c => c.categoryId === productData.categoryId);
      const foundBrand = brands.find(b => b.brandId === productData.brandId);
      
      // Try multiple field name variations for subcategory matching
      const foundSubcategory = productData.subCategoryId 
        ? subcategories.find(sc => {
            // The API returns subCategoryId (with capital C)
            const scId = sc.subCategoryId || sc.subcategoryId;
            const prodId = productData.subCategoryId;
            return scId?.toLowerCase() === prodId?.toLowerCase();
          })
        : null;

      setCategory(foundCategory || null);
      setBrand(foundBrand || null);
      setSubcategory(foundSubcategory || null);
    } catch (err) {
      console.error("Error fetching product details:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch product details");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (stock < 10) return { label: "Low Stock", variant: "outline" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            Product Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Loading product details...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-3 rounded-full bg-destructive/10 mb-3">
              <X className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : product ? (
          <div className="space-y-6">
            {/* Product Name and Status */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{product.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">Product ID: {product.productId}</p>
              </div>
              <Badge {...getStockStatus(product.stockQty)}>
                {getStockStatus(product.stockQty).label}
              </Badge>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1 text-foreground">{product.description}</p>
              </div>
            )}

            {/* Grid Layout for Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <div className="p-2 rounded-md bg-primary/10">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="text-base font-semibold text-foreground mt-1">
                    {category?.name || product.categoryId}
                  </p>
                </div>
              </div>

              {/* Brand */}
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <div className="p-2 rounded-md bg-accent/10">
                  <Tag className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Brand</p>
                  <p className="text-base font-semibold text-foreground mt-1">
                    {brand?.name || product.brandId}
                  </p>
                </div>
              </div>

              {/* Barcode */}
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <div className="p-2 rounded-md bg-blue-500/10">
                  <Barcode className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Barcode</p>
                  <p className="text-base font-semibold text-foreground mt-1">
                    {product.barcode || "N/A"}
                  </p>
                </div>
              </div>

              {/* Stock Quantity */}
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <div className="p-2 rounded-md bg-success/10">
                  <Hash className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stock Quantity</p>
                  <p className={`text-base font-semibold mt-1 ${product.stockQty < 10 ? 'text-warning' : 'text-foreground'}`}>
                    {product.stockQty} units
                  </p>
                </div>
              </div>

              {/* Cost Price */}
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <div className="p-2 rounded-md bg-orange-500/10">
                  <DollarSign className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unit Price</p>
                  <p className="text-base font-semibold text-foreground mt-1">
                    Rs. {Number(product.costPrice).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Selling Price */}
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <div className="p-2 rounded-md bg-green-500/10">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Selling Price</p>
                  <p className="text-base font-semibold text-foreground mt-1">
                    Rs. {Number(product.sellingPrice).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Subcategory */}
              {product.subCategoryId && (
                <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                  <div className="p-2 rounded-md bg-purple-500/10">
                    <Layers className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Subcategory</p>
                    <p className="text-base font-semibold text-foreground mt-1">
                      {subcategory?.name || product.subCategoryId}
                    </p>
                    {subcategory && (
                      <p className="text-xs text-muted-foreground mt-1">ID: {product.subCategoryId}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Expiry Date */}
              {product.expiry_date && (
                <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                  <div className="p-2 rounded-md bg-red-500/10">
                    <Calendar className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expiry Date</p>
                    <p className="text-base font-semibold text-foreground mt-1">
                      {formatDate(product.expiry_date)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Profit Margin */}
            <div className="p-4 rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    Rs. {(product.sellingPrice - product.costPrice).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">Margin %</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {product.costPrice > 0 
                      ? (((product.sellingPrice - product.costPrice) / product.costPrice) * 100).toFixed(1)
                      : '0'}%
                  </p>
                </div>
              </div>
            </div>

            {/* Product Subcategories */}
            {product.productSubcategories && product.productSubcategories.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Subcategories</h4>
                <div className="space-y-2">
                  {product.productSubcategories.map((sub, index) => (
                    <div key={index} className="p-3 rounded-lg border bg-card flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{sub.subcategoryId}</Badge>
                        <span className="text-sm text-muted-foreground">Qty: {sub.quantity}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Rs. {sub.price.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">Exp: {formatDate(sub.expiryDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}