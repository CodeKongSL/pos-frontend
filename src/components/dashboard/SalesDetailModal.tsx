// src/components/dashboard/SalesDetailModal.tsx
import { X, DollarSign, CreditCard, Wallet, TrendingUp, Receipt, Tag } from "lucide-react";
import { SalesData, formatCurrency } from "@/components/dashboard/salesService";

interface SalesDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  salesData: SalesData | null;
  isLoading: boolean;
}

export function SalesDetailModal({ isOpen, onClose, salesData, isLoading }: SalesDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Daily Sales Summary</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {salesData && new Date(salesData.reportDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : salesData ? (
            <div className="space-y-6">
              {/* Main Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                  </div>
                  <p className="text-3xl font-bold text-primary">{salesData.totalSales}</p>
                  <p className="text-xs text-muted-foreground mt-1">Number of transactions</p>
                </div>

                <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg p-4 border border-accent/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-accent/20 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-accent" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  </div>
                  <p className="text-3xl font-bold text-accent">{formatCurrency(salesData.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Gross revenue</p>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  Payment Breakdown
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-secondary rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">Cash Sales</p>
                      </div>
                      <p className="text-sm font-bold text-foreground">{salesData.cashSales}</p>
                    </div>
                    <p className="text-xl font-bold text-accent">{formatCurrency(salesData.cashRevenue)}</p>
                  </div>

                  <div className="bg-secondary rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">Card Sales</p>
                      </div>
                      <p className="text-sm font-bold text-foreground">{salesData.cardSales}</p>
                    </div>
                    <p className="text-xl font-bold text-accent">{formatCurrency(salesData.cardRevenue)}</p>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  Additional Details
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Discount</p>
                    <p className="text-sm font-bold text-foreground">{formatCurrency(salesData.totalDiscount)}</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Tax</p>
                    <p className="text-sm font-bold text-foreground">{formatCurrency(salesData.totalTax)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-secondary rounded-full mb-4">
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium">No sales data available</p>
              <p className="text-sm text-muted-foreground mt-1">Unable to load sales information</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}