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
import { Plus, Package, Loader2 } from "lucide-react";
import { ProductService } from "./product/services/product.service";
import { Product } from "./product/models/product.model";
import { assignProductToSupplier } from "./supplier/services/supplier.service";

interface ProductSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  supplierId: string;
  supplierName: string;
}

export default function ProductSelectionDialog({
  open,
  onClose,
  supplierId,
  supplierName,
}: ProductSelectionDialogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  useEffect(() => {
    if (open) {
      fetchProducts();
      setShowAddProduct(false);
      setSelectedProductId("");
    }
  }, [open]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await ProductService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
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
      
      // Reset state
      setSelectedProductId("");
      setShowAddProduct(false);
      
      // Optionally close the dialog
      // onClose();
      
    } catch (error) {
      console.error('Error assigning product:', error);
      alert(error instanceof Error ? error.message : 'Failed to assign product. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  // Filter products with stock
  const availableProducts = products.filter(p => p.stockQty > 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Products for {supplierName}
          </DialogTitle>
          <DialogDescription>
            Assign products to this supplier
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!showAddProduct ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Package className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                Assign products to this supplier
              </p>
              <Button
                onClick={() => setShowAddProduct(true)}
                className="bg-primary hover:bg-primary-hover"
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Products
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
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