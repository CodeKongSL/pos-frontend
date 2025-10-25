import { useState, useEffect } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Stock } from "@/components/stock/models/stock.model";
import { useToast } from "@/hooks/use-toast";

interface DeleteStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  batches: Stock[];
  onSuccess: () => void;
}

export default function DeleteStockDialog({
  open,
  onOpenChange,
  productId,
  productName,
  batches,
  onSuccess,
}: DeleteStockDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedBatchId("");
    }
  }, [open]);

  const selectedBatch = batches.find(b => b.batchId === selectedBatchId);

  const handleDelete = async () => {
    if (!selectedBatchId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a batch to delete",
      });
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("https://my-go-backend.onrender.com/DeleteBatch", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          batchId: selectedBatchId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete stock batch");
      }

      toast({
        title: "Success",
        description: `Batch ${selectedBatchId} deleted successfully`,
      });

      // Reset form
      setSelectedBatchId("");

      // Close dialog and refresh parent
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      console.error("Error deleting stock batch:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete stock batch",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setSelectedBatchId("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Stock Batch
          </DialogTitle>
          <DialogDescription>
            Select a batch to delete for <span className="font-semibold text-foreground">{productName}</span> ({productId})
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="batchId">
              Select Batch to Delete <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a batch to delete" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem
                    key={batch.id}
                    value={batch.batchId || ""}
                    className={
                      (selectedBatchId === batch.batchId)
                        ? "!bg-red-100 !text-red-700 !border-red-300"
                        : ""
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span className={
                        (selectedBatchId === batch.batchId)
                          ? "font-medium text-red-700"
                          : "font-medium"
                      }>
                        {batch.batchId || "No Batch ID"}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          (selectedBatchId === batch.batchId)
                            ? "text-xs bg-red-100 text-red-700 border-red-300"
                            : "text-xs"
                        }
                      >
                        Qty: {batch.stockQty}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          (selectedBatchId === batch.batchId)
                            ? "text-xs bg-red-100 text-red-700 border-red-300"
                            : "text-xs"
                        }
                      >
                        {batch.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedBatch && (
              <div className="text-sm text-muted-foreground mt-1 space-y-1">
                <div>Batch ID: <span className="font-semibold text-foreground">{selectedBatch.batchId}</span></div>
                <div>Quantity: <span className="font-semibold text-foreground">{selectedBatch.stockQty}</span></div>
                <div>Expiry: <span className="font-semibold text-foreground">{new Date(selectedBatch.expiry_date).toLocaleDateString()}</span></div>
              </div>
            )}
          </div>

          {selectedBatchId && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold">Warning: This action cannot be undone!</p>
                <p className="text-sm mt-1">This will permanently delete the selected batch and all its data.</p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || !selectedBatchId}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Batch
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}