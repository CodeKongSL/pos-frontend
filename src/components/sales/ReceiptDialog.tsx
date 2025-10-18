import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { CreateSaleResponse } from "@/services/salesApi";

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saleData: CreateSaleResponse["sale"] | null;
  onNewSale: () => void;
}

export function ReceiptDialog({
  open,
  onOpenChange,
  saleData,
  onNewSale,
}: ReceiptDialogProps) {
  if (!saleData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleNewSale = () => {
    onOpenChange(false);
    onNewSale();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4" id="receipt-content">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h2 className="text-2xl font-bold">SALE RECEIPT</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Sale ID: {saleData.id}
            </p>
            <p className="text-sm text-muted-foreground">
              Date: {new Date(saleData.date).toLocaleString()}
            </p>
          </div>

          {/* Customer Info */}
          {(saleData.customerName || saleData.mobileNumber) && (
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-2">Customer Information</h3>
              {saleData.customerName && (
                <p className="text-sm">Name: {saleData.customerName}</p>
              )}
              {saleData.mobileNumber && (
                <p className="text-sm">Phone: {saleData.mobileNumber}</p>
              )}
            </div>
          )}

          {/* Items */}
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-3">Items</h3>
            <div className="space-y-2">
              {saleData.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-muted-foreground">
                      {item.quantity} x Rs. {item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">Rs. {item.totalPrice.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>Rs. {saleData.subtotal.toFixed(2)}</span>
            </div>
            {saleData.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>Rs. {saleData.tax.toFixed(2)}</span>
              </div>
            )}
            {saleData.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Discount:</span>
                <span>- Rs. {saleData.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span>Rs. {saleData.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Payment Details</h3>
            <p className="text-sm">
              Method: <span className="font-medium capitalize">{saleData.paymentMethod}</span>
            </p>
            {saleData.paymentMethod === "cash" && saleData.amountReceived && (
              <>
                <p className="text-sm">
                  Amount Received: <span className="font-medium">Rs. {saleData.amountReceived.toFixed(2)}</span>
                </p>
                {saleData.change !== undefined && (
                  <p className="text-sm">
                    Change: <span className="font-medium">Rs. {saleData.change.toFixed(2)}</span>
                  </p>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>Thank you for your business!</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handlePrint} variant="outline" className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
          <Button onClick={handleNewSale} className="flex-1">
            New Sale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
