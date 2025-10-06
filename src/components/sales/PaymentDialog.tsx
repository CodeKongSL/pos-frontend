import { useState } from "react";
import { CreditCard, Banknote } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  onPaymentComplete: (method: string) => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  total,
  onPaymentComplete,
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cashAmount, setCashAmount] = useState("");

  const handlePayment = () => {
    onPaymentComplete(paymentMethod);
    setPaymentMethod("");
    setCashAmount("");
  };

  const change = cashAmount ? parseFloat(cashAmount) - total : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
          <DialogDescription>
            Select payment method and complete the transaction
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Amount</p>
            <p className="text-3xl font-bold">Rs. {total.toFixed(2)}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={paymentMethod === "cash" ? "default" : "outline"}
              onClick={() => setPaymentMethod("cash")}
              className="h-20 flex flex-col gap-2"
            >
              <Banknote className="h-6 w-6" />
              <span>Cash</span>
            </Button>
            <Button
              variant={paymentMethod === "card" ? "default" : "outline"}
              onClick={() => setPaymentMethod("card")}
              className="h-20 flex flex-col gap-2"
            >
              <CreditCard className="h-6 w-6" />
              <span>Card</span>
            </Button>
          </div>

          {paymentMethod === "cash" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cash Received</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                />
              </div>
              {cashAmount && (
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Change</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    Rs. {Math.max(0, change).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <Button
          onClick={handlePayment}
          disabled={!paymentMethod || (paymentMethod === "cash" && (!cashAmount || parseFloat(cashAmount) < total))}
          className="w-full"
        >
          Complete Payment
        </Button>
      </DialogContent>
    </Dialog>
  );
}