// src/components/dashboard/ProfitDetailModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, Target, DollarSign, CreditCard } from "lucide-react";

interface ProfitData {
  sales_target: number;
  target_profit: number;
  total_spend: number;
}

interface ProfitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  profitData: ProfitData | null;
  isLoading: boolean;
}

export function ProfitDetailModal({ isOpen, onClose, profitData, isLoading }: ProfitDetailModalProps) {
  const formatCurrency = (amount: number): string => {
    return `Rs. ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calculateProfitMargin = (): string => {
    if (!profitData || profitData.sales_target === 0) return "0";
    const margin = (profitData.target_profit / profitData.sales_target) * 100;
    return margin.toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-6 w-6 text-accent" />
            Profit Overview
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : profitData ? (
          <div className="space-y-6 py-4">
            {/* Expected Profit - Highlight */}
            <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg p-6 border-2 border-accent/20">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    Expected Profit
                  </p>
                  <p className="text-3xl font-bold text-accent">
                    {formatCurrency(profitData.target_profit)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Profit Margin: {calculateProfitMargin()}%
                  </p>
                </div>
              </div>
            </div>

            {/* Sales Target */}
            <div className="bg-secondary rounded-lg p-5 border border-border">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Sales Target
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(profitData.sales_target)}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Spend */}
            <div className="bg-secondary rounded-lg p-5 border border-border">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-destructive" />
                    Total Spend
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(profitData.total_spend)}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">Financial Summary</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Sales Target:</span>
                  <span className="font-medium text-foreground">{formatCurrency(profitData.sales_target)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Spend:</span>
                  <span className="font-medium text-destructive">- {formatCurrency(profitData.total_spend)}</span>
                </div>
                <div className="h-px bg-border my-2"></div>
                <div className="flex justify-between font-semibold">
                  <span className="text-foreground">Expected Profit:</span>
                  <span className="text-accent">{formatCurrency(profitData.target_profit)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No profit data available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}