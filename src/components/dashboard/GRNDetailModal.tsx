// src/components/dashboard/GRNDetailModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RotateCcw, Loader2 } from "lucide-react";

interface GRNDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  grnsCount: number | null;
  isLoading: boolean;
}

export function GRNDetailModal({
  isOpen,
  onClose,
  grnsCount,
  isLoading,
}: GRNDetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <RotateCcw className="h-6 w-6 text-primary" />
            Total GRNs Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : grnsCount !== null ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-sm text-muted-foreground mb-2">Total GRNs</p>
                <p className="text-3xl font-bold text-primary">{grnsCount}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {grnsCount === 1 ? 'transaction' : 'transactions'} recorded
                </p>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm font-medium text-success">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm font-medium">Just now</span>
                </div>
              </div>

              {grnsCount === 0 && (
                <div className="rounded-lg bg-warning/10 border border-warning/20 p-3">
                  <p className="text-sm text-warning">No GRN transactions recorded today</p>
                </div>
              )}
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