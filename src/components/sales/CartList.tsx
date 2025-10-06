import { ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartItem } from "./CartItem";

interface CartProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartListProps {
  items: CartProduct[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export function CartList({
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CartListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Cart Items ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No items in cart</p>
            <p className="text-sm">Scan or select products to add</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <CartItem
                key={item.id}
                id={item.id}
                name={item.name}
                price={item.price}
                quantity={item.quantity}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemoveItem}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}