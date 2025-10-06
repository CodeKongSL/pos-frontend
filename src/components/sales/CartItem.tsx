import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({
  id,
  name,
  price,
  quantity,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      <div className="flex-1">
        <p className="font-medium">{name}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Rs. {price} each
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateQuantity(id, quantity - 1)}
          className="h-8 w-8 p-0"
        >
          -
        </Button>
        <span className="w-12 text-center font-medium">
          {quantity}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateQuantity(id, quantity + 1)}
          className="h-8 w-8 p-0"
        >
          +
        </Button>
      </div>
      <div className="text-right w-24">
        <p className="font-semibold">
          Rs. {(price * quantity).toFixed(2)}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onRemove(id)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}