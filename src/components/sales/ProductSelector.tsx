import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface ProductSelectorProps {
  products: Product[];
  showProductList: boolean;
  onToggleProductList: () => void;
  onSelectProduct: (product: Product) => void;
}

export function ProductSelector({
  products,
  showProductList,
  onToggleProductList,
  onSelectProduct,
}: ProductSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Select Product</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          onClick={onToggleProductList}
          className="w-full justify-between"
        >
          Choose a product...
          <Plus className="h-4 w-4" />
        </Button>
        {showProductList && (
          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="w-full p-3 text-left border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Stock: {product.stock}
                    </p>
                  </div>
                  <p className="font-semibold">Rs. {product.price}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}