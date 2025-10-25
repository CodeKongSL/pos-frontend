import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { StockService } from "@/components/stock/services/stock.service";
import { Stock } from "@/components/stock/models/stock.model";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ChangeStockQuantityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  batches: Stock[];
  onSuccess?: () => void;
}

export default function ChangeStockQuantityDialog({
  open,
  onOpenChange,
  productId,
  productName,
  batches,
  onSuccess,
}: ChangeStockQuantityDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [newQuantity, setNewQuantity] = useState<string>("");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedBatchId("");
      setNewQuantity("");
    }
  }, [open]);

  const selectedBatch = batches.find(b => b.batchId === selectedBatchId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBatchId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a batch",
      });
      return;
    }

    setIsLoading(true);

    try {
      const requestBody = {
        productId: productId,
        batchId: selectedBatchId,
        stockQty: parseInt(newQuantity),
      };

      await StockService.editBatchStock(requestBody);

      toast({
        title: "Success",
        description: `Stock quantity updated successfully for batch ${selectedBatchId}`,
      });

      // Reset form
      setSelectedBatchId("");
      setNewQuantity("");

      // Close dialog and trigger refresh
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating stock quantity:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update stock quantity. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change Stock Quantity</DialogTitle>
          <DialogDescription>
            Update the quantity for <span className="font-semibold text-foreground">{productName}</span> ({productId})
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="batchId">
                Select Batch <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem
                      key={batch.id}
                      value={batch.batchId || ""}
                      className={
                        (selectedBatchId === batch.batchId)
                          ? "!bg-blue-100 !text-blue-700 !border-blue-300 !hover:bg-blue-200"
                          : ""
                      }
                    >
                      <div className="flex items-center gap-2">
                        <span className={
                          (selectedBatchId === batch.batchId)
                            ? "font-medium text-blue-700"
                            : "font-medium"
                        }>
                          {batch.batchId || "No Batch ID"}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            (selectedBatchId === batch.batchId)
                              ? "text-xs bg-blue-100 text-blue-700 border-blue-300"
                              : "text-xs"
                          }
                        >
                          Current: {batch.stockQty}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBatch && (
                <div className="text-sm text-muted-foreground mt-1">
                  Current quantity: <span className="font-semibold text-foreground">{selectedBatch.stockQty}</span>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="stockQty">
                New Stock Quantity <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stockQty"
                type="number"
                min="0"
                placeholder="Enter new quantity"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                required
                disabled={!selectedBatchId}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedBatchId}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  Update Quantity
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
