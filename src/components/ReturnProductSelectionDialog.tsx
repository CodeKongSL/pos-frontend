import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Badge } from "@/components/ui/badge";

interface ReturnProductSelectionDialogProps {
  onProductSelect: (product: Product) => void;
}

export default function ReturnProductSelectionDialog({
  onProductSelect
}: ReturnProductSelectionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

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

  const handleAddProduct = () => {
    const selectedProduct = products.find(p => p.productId === selectedProductId);
    if (selectedProduct) {
      onProductSelect(selectedProduct);
      setSelectedProductId("");
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Select Product to Return
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Select
              value={selectedProductId}
              onValueChange={setSelectedProductId}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue 
                  placeholder={
                    loading 
                      ? "Loading products..." 
                      : products.length === 0 
                      ? "No products available" 
                      : "Choose a product"
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {products.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    {loading ? "Loading..." : "No products available"}
                  </div>
                ) : (
                  products.map((product) => (
                    <SelectItem key={product.productId} value={product.productId}>
                      <div className="flex flex-col">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Rs. {product.sellingPrice.toFixed(2)} • Stock: {product.stockQty}
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
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddProduct}
              disabled={!selectedProductId || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}