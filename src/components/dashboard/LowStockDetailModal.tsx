// src/components/dashboard/LowStockDetailModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package } from "lucide-react";
import { LowStockProduct } from "./dashboardService";

interface LowStockDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lowStockProducts: LowStockProduct[];
  isLoading: boolean;
}

export function LowStockDetailModal({ 
  isOpen, 
  onClose, 
  lowStockProducts,
  isLoading 
}: LowStockDetailModalProps) {
  const formatCurrency = (amount: number): string => {
    return `Rs. ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStockSeverity = (qty: number): { label: string; variant: "destructive" | "outline" | "secondary" } => {
    if (qty <= 3) return { label: "Critical", variant: "destructive" };
    if (qty <= 10) return { label: "Low", variant: "outline" };
    return { label: "Medium", variant: "secondary" };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-6 w-6 text-warning" />
            Low Stock Alert Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : lowStockProducts.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-warning/10 rounded-lg border border-warning/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-semibold text-foreground">Total Low Stock Products</p>
                  <p className="text-sm text-muted-foreground">Items requiring immediate attention</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-warning">{lowStockProducts.length}</p>
            </div>

            <div className="space-y-3">
              {lowStockProducts.map((product) => {
                const severity = getStockSeverity(product.stockQty);
                
                return (
                  <div 
                    key={product.productId} 
                    className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                            <Badge variant={severity.variant} className="text-xs">
                              {severity.label}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <p>Product ID: <span className="text-foreground font-medium">{product.productId}</span></p>
                            {product.barcode && (
                              <p>Barcode: <span className="text-foreground font-medium">{product.barcode}</span></p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Stock:</span>
                          <span className="text-2xl font-bold text-warning">{product.stockQty}</span>
                          <span className="text-sm text-muted-foreground">units</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Cost Price</p>
                        <p className="font-semibold text-foreground">{formatCurrency(product.costPrice)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Selling Price</p>
                        <p className="font-semibold text-success">{formatCurrency(product.sellingPrice)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Expiry Date</p>
                        <p className="font-semibold text-foreground">{formatDate(product.expiry_date)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Stock Value</p>
                        <p className="font-semibold text-accent">{formatCurrency(product.stockQty * product.costPrice)}</p>
                      </div>
                    </div>

                    {product.batches && product.batches.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-semibold text-foreground mb-2">Batch Information</p>
                        <div className="space-y-2">
                          {product.batches.map((batch) => (
                            <div 
                              key={batch.batchId} 
                              className="flex flex-wrap items-center gap-3 p-2 rounded bg-secondary/50 text-xs"
                            >
                              <span className="font-medium text-foreground">{batch.batchId}</span>
                              <span className="text-muted-foreground">Qty: <span className="text-foreground font-medium">{batch.stockQty}</span></span>
                              <span className="text-muted-foreground">Expiry: <span className="text-foreground font-medium">{formatDate(batch.expiry_date)}</span></span>
                              <span className="text-muted-foreground">Cost: <span className="text-foreground font-medium">{formatCurrency(batch.costPrice)}</span></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No low stock products</p>
            <p className="text-sm text-muted-foreground mt-2">All products have sufficient stock levels</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}