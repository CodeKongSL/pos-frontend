import { Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OrderSummaryProps {
  subtotal: number;
  onCheckout: () => void;
  onPrintBill: () => void;
  disabled: boolean;
}

export function OrderSummary({
  subtotal,
  onCheckout,
  onPrintBill,
  disabled,
}: OrderSummaryProps) {
  // For now, tax and discount are fixed at 0
  const tax = 0;
  const discount = 0;
  const total = subtotal + tax - discount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
            <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Tax</span>
            <span className="font-medium">Rs. {tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Discount</span>
            <span className="font-medium">Rs. {discount.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="text-lg font-bold">Total</span>
            <span className="text-lg font-bold text-blue-600">
              Rs. {total.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={onCheckout}
            className="w-full"
            disabled={disabled}
          >
            Checkout
          </Button>
          <Button
            onClick={onPrintBill}
            variant="outline"
            className="w-full"
            disabled={disabled}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Bill
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}