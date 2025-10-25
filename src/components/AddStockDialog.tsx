import { useState } from "react";
import { Plus } from "lucide-react";
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

interface AddStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  onSuccess?: () => void;
}

export default function AddStockDialog({
  open,
  onOpenChange,
  productId,
  productName,
  onSuccess,
}: AddStockDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    stockQty: "",
    expiryDate: "",
    costPrice: "",
    sellingPrice: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Convert date to ISO format with time
      const expiryDateISO = new Date(formData.expiryDate).toISOString();

      const requestBody = {
        productId: productId,
        stockQty: parseInt(formData.stockQty),
        expiryDate: expiryDateISO,
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
      };

      // Use the service instead of direct fetch
      await StockService.addStock(requestBody);

      toast({
        title: "Success",
        description: `Stock added successfully to ${productName}`,
      });

      // Reset form
      setFormData({
        stockQty: "",
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
      console.error("Error adding stock:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add stock. Please try again.",
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
          <DialogTitle>Add Stock</DialogTitle>
          <DialogDescription>
            Add new stock for <span className="font-semibold text-foreground">{productName}</span> ({productId})
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stockQty">
                Stock Quantity <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stockQty"
                type="number"
                min="1"
                placeholder="Enter stock quantity"
                value={formData.stockQty}
                onChange={(e) => handleInputChange("stockQty", e.target.value)}
                required
              />
            </div>

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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
