import { useState, useEffect } from "react";
import { FileEdit } from "lucide-react";
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

interface ChangeStockDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  batches: Stock[];
  onSuccess?: () => void;
}

export default function ChangeStockDetailsDialog({
  open,
  onOpenChange,
  productId,
  productName,
  batches,
  onSuccess,
}: ChangeStockDetailsDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [formData, setFormData] = useState({
    expiryDate: "",
    costPrice: "",
    sellingPrice: "",
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedBatchId("");
      setFormData({
        expiryDate: "",
        costPrice: "",
        sellingPrice: "",
      });
    }
  }, [open]);

  // Populate form when batch is selected
  useEffect(() => {
    if (selectedBatchId) {
      const batch = batches.find(b => b.batchId === selectedBatchId);
      if (batch) {
        // Convert expiry date to YYYY-MM-DD format for input
        const expiryDate = new Date(batch.expiry_date);
        const formattedDate = expiryDate.toISOString().split('T')[0];
        
        setFormData({
          expiryDate: formattedDate,
          costPrice: batch.costPrice?.toString() || "",
          sellingPrice: batch.sellingPrice?.toString() || "",
        });
      }
    }
  }, [selectedBatchId, batches]);

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
      // Convert date to ISO format with time
      const expiryDateISO = new Date(formData.expiryDate).toISOString();

      const requestBody = {
        productId: productId,
        batchId: selectedBatchId,
        expiryDate: expiryDateISO,
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
      };

      await StockService.editBatchDetails(requestBody);

      toast({
        title: "Success",
        description: `Stock details updated successfully for batch ${selectedBatchId}`,
      });

      // Reset form
      setSelectedBatchId("");
      setFormData({
        expiryDate: "",
        costPrice: "",
        sellingPrice: "",
      });

      // Close dialog and trigger refresh
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating stock details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update stock details. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change Stock Details</DialogTitle>
          <DialogDescription>
            Update details for <span className="font-semibold text-foreground">{productName}</span> ({productId})
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
                    <SelectItem key={batch.id} value={batch.batchId || ""}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {batch.batchId || "No Batch ID"}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Qty: {batch.stockQty}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBatch && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="expiryDate">
                    Expiry Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="costPrice">
                    Cost Price <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter cost price"
                    value={formData.costPrice}
                    onChange={(e) => handleInputChange("costPrice", e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sellingPrice">
                    Selling Price <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter selling price"
                    value={formData.sellingPrice}
                    onChange={(e) => handleInputChange("sellingPrice", e.target.value)}
                    required
                  />
                </div>
              </>
            )}
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
                  <FileEdit className="h-4 w-4 mr-2" />
                  Update Details
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
