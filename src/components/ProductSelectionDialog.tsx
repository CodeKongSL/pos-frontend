// src/components/ProductSelectionDialog.tsx

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Package, Loader2, Trash2 } from "lucide-react";
import { ProductService } from "./product/services/product.service";
import { Product, PaginatedProductResponse } from "./product/models/product.model";
import { assignProductToSupplier, findProductsBySupplierID } from "./supplier/services/supplier.service";
import { Badge } from "@/components/ui/badge";

interface ProductSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  supplierId: string;
  supplierName: string;
}

interface AssignedProduct {
  _id: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  assignedAt: string;
  created_at: string;
  updated_at: string;
}

export default function ProductSelectionDialog({
  open,
  onClose,
  supplierId,
  supplierName,
}: ProductSelectionDialogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [assignedProducts, setAssignedProducts] = useState<AssignedProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAssignedProducts();
      setShowAddProduct(false);
      setSelectedProductId("");
    }
  }, [open]);

  const fetchAssignedProducts = async () => {
    setLoadingAssigned(true);
    try {
      const data = await findProductsBySupplierID(supplierId);
      setAssignedProducts(data);
    } catch (error) {
      console.error('Error fetching assigned products:', error);
      setAssignedProducts([]);
    } finally {
      setLoadingAssigned(false);
    }
  };

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const response = await ProductService.getAllProducts({ per_page: 1000 }); // Get a large number for dialogs
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowAddProduct = () => {
    setShowAddProduct(true);
    fetchAllProducts();
  };

  const handleAddProduct = async () => {
    if (!selectedProductId) return;

    const selectedProduct = products.find(p => p.productId === selectedProductId);
    if (!selectedProduct) return;

    setAssigning(true);
    try {
      console.log("Assigning product to supplier:", {
        supplierId,
        productId: selectedProductId,
        productName: selectedProduct.name
      });

      const response = await assignProductToSupplier(supplierId, selectedProductId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to assign product to supplier');
      }

      // Success - show notification
      alert(`Product "${selectedProduct.name}" successfully assigned to ${supplierName}!`);
      
      // Reset state and refresh assigned products
      setSelectedProductId("");
      setShowAddProduct(false);
      await fetchAssignedProducts();
      
    } catch (error) {
      console.error('Error assigning product:', error);
      alert(error instanceof Error ? error.message : 'Failed to assign product. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  // Filter out already assigned products
  const assignedProductIds = assignedProducts.map(ap => ap.productId);
  const availableProducts = products.filter(
    p => p.stockQty > 0 && !assignedProductIds.includes(p.productId)
  );

  const hasAssignedProducts = assignedProducts.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Products for {supplierName}
          </DialogTitle>
          <DialogDescription>
            {hasAssignedProducts 
              ? "Manage products assigned to this supplier" 
              : "Assign products to this supplier"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loadingAssigned ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !hasAssignedProducts && !showAddProduct ? (
            // Empty state - no products assigned
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Package className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                Assign products to this supplier
              </p>
              <Button
                onClick={handleShowAddProduct}
                className="bg-primary hover:bg-primary-hover"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Products
              </Button>
            </div>
          ) : hasAssignedProducts && !showAddProduct ? (
            // Show assigned products list
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  Assigned Products ({assignedProducts.length})
                </h3>
                <Button
                  onClick={handleShowAddProduct}
                  size="sm"
                  className="bg-primary hover:bg-primary-hover"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add More
                </Button>
              </div>

              <div className="space-y-2">
                {assignedProducts.map((assignedProduct) => (
                  <div
                    key={assignedProduct._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {assignedProduct.productName}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {assignedProduct.productId}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Assigned: {new Date(assignedProduct.assignedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {/* Optional: Add remove button
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    */}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Add product form
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Add New Product</h3>
                {hasAssignedProducts && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddProduct(false);
                      setSelectedProductId("");
                    }}
                  >
                    Back to List
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Product</label>
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                  disabled={loading || assigning}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        loading 
                          ? "Loading products..." 
                          : availableProducts.length === 0 
                          ? "No products available" 
                          : "Choose a product"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        {loading ? "Loading..." : "No products available"}
                      </div>
                    ) : (
                      availableProducts.map((product) => (
                        <SelectItem key={product.productId} value={product.productId}>
                          <div className="flex flex-col">
                            <span className="font-medium">{product.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ${product.sellingPrice.toFixed(2)} • Stock: {product.stockQty}
                              {product.barcode && ` • ${product.barcode}`}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddProduct(false);
                    setSelectedProductId("");
                  }}
                  disabled={assigning}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddProduct}
                  disabled={!selectedProductId || assigning}
                  className="bg-primary hover:bg-primary-hover"
                >
                  {assigning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Assign Product
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}