// src/components/dashboard/StockDetailModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, Loader2 } from "lucide-react";

interface StockDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockQuantity: number | null;
  isLoading: boolean;
}

export function StockDetailModal({
  isOpen,
  onClose,
  stockQuantity,
  isLoading,
}: StockDetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-6 w-6 text-primary" />
            Available Stock Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : stockQuantity !== null ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-sm text-muted-foreground mb-2">Total Stock Quantity</p>
                <p className="text-3xl font-bold text-primary">{stockQuantity.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-2">units across all products</p>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <button
                  className="w-full mt-2 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary-hover transition-colors text-center font-medium"
                  onClick={() => {
                    window.location.href = '/stocks';
                  }}
                >
                  Go to stocks
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}