import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Package, FileEdit } from "lucide-react";

interface EditStockOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  onChangeQuantity?: () => void;
  onChangeDetails?: () => void;
}

export default function EditStockOptionsDialog({
  open,
  onOpenChange,
  productId,
  productName,
  onChangeQuantity,
  onChangeDetails,
}: EditStockOptionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Stock</DialogTitle>
          <DialogDescription>
            Choose what you'd like to update for <span className="font-semibold text-foreground">{productName}</span> ({productId})
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3 py-4">
          <Button
            variant="outline"
            className="h-auto py-4 flex-col items-start hover:bg-primary/5 hover:border-primary"
            onClick={() => {
              onOpenChange(false);
              onChangeQuantity?.();
            }}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-base text-foreground">Change Stock Quantity</div>
                <div className="text-sm text-muted-foreground font-normal">
                  Update the quantity for specific batches
                </div>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 flex-col items-start hover:bg-primary/5 hover:border-primary"
            onClick={() => {
              onOpenChange(false);
              onChangeDetails?.();
            }}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileEdit className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-base text-foreground">Change Stock Details</div>
                <div className="text-sm text-muted-foreground font-normal">
                  Update expiry date, cost price, and selling price
                </div>
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
