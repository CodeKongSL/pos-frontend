// src/components/dashboard/PopularProductsDetailModal.tsx
import { X, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TopSellingItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

interface PopularProductsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  topSellingItems: TopSellingItem[];
  isLoading?: boolean;
}

export function PopularProductsDetailModal({
  isOpen,
  onClose,
  topSellingItems,
  isLoading = false
}: PopularProductsDetailModalProps) {
  const formatCurrency = (amount: number): string => {
    return `Rs. ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-5 w-5 text-accent" />
            Popular Products Today
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : topSellingItems && topSellingItems.length > 0 ? (
            <div className="space-y-4 mt-4">
              {topSellingItems.map((item, index) => (
                <div
                  key={item.productId}
                  className="flex items-start justify-between p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-foreground mb-1">
                        {item.productName}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>Product ID: {item.productId}</span>
                        <span>Unit Price: {formatCurrency(item.unitPrice)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-accent mb-1">
                      {formatCurrency(item.totalAmount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} units sold
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No products sold today
            </div>
          )}
        </ScrollArea>

        {!isLoading && topSellingItems && topSellingItems.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Items:</span>
              <span className="font-semibold">{topSellingItems.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-muted-foreground">Total Units Sold:</span>
              <span className="font-semibold">
                {topSellingItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-muted-foreground">Total Revenue:</span>
              <span className="font-semibold text-accent">
                {formatCurrency(topSellingItems.reduce((sum, item) => sum + item.totalAmount, 0))}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}