// src/components/dashboard/ExpiringStocksDetailModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { ExpiringStock } from "./dashboardService";

interface ExpiringStocksDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expiringStocks: ExpiringStock[];
  isLoading: boolean;
}

export function ExpiringStocksDetailModal({ 
  isOpen, 
  onClose, 
  expiringStocks,
  isLoading 
}: ExpiringStocksDetailModalProps) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Expired ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'} ago`;
    } else if (diffDays === 0) {
      return 'Expires today';
    } else if (diffDays === 1) {
      return 'Expires tomorrow';
    } else {
      return `Expires in ${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    }
  };

  const getStatusBadge = (stock: ExpiringStock) => {
    const date = new Date(stock.expiry_date);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (diffDays <= 2) {
      return <Badge variant="destructive">Critical</Badge>;
    } else {
      return <Badge variant="outline" className="border-warning text-warning">Warning</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Expiring Items (Next 7 Days)
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : expiringStocks.length > 0 ? (
          <div className="space-y-3">
            {expiringStocks.map((stock, index) => (
              <div 
                key={`${stock.product_id}-${stock.batch_id || index}`}
                className="flex items-start gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/20"
              >
                <AlertTriangle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{stock.product_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Product ID: {stock.product_id}
                        {stock.batch_id && ` • Batch: ${stock.batch_id}`}
                      </p>
                    </div>
                    {getStatusBadge(stock)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Expiry Date</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(stock.expiry_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-destructive">{formatDate(stock.expiry_date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Stock Quantity</p>
                      <p className="text-sm font-medium text-foreground">
                        {stock.stock_qty} {stock.stock_qty === 1 ? 'unit' : 'units'}
                      </p>
                      <p className="text-xs text-muted-foreground">Status: {stock.product_status}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>No items expiring in the next 7 days</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}