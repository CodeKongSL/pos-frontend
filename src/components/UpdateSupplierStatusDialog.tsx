import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { updateSupplierStatus } from "./supplier/services/supplier.service";

interface UpdateSupplierStatusDialogProps {
  open: boolean;
  onClose: () => void;
  supplierId: string;
  supplierName: string;
  currentStatus: string;
  onSuccess: () => void;
}

export default function UpdateSupplierStatusDialog({
  open,
  onClose,
  supplierId,
  supplierName,
  currentStatus,
  onSuccess,
}: UpdateSupplierStatusDialogProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await updateSupplierStatus(supplierId, status);

      if (response.ok) {
        onSuccess();
        onClose();
        // Reset to current status for next open
        setStatus(currentStatus);
      } else {
        alert("Failed to update supplier status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating supplier status:", error);
      alert("An error occurred while updating the status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStatus(currentStatus);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Supplier Status</DialogTitle>
          <DialogDescription>
            Change the status for {supplierName} ({supplierId})
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={status} onValueChange={setStatus}>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="active" id="active" />
              <Label htmlFor="active" className="cursor-pointer">
                Active
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="inactive" id="inactive" />
              <Label htmlFor="inactive" className="cursor-pointer">
                Inactive
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || status === currentStatus}
          >
            {isSubmitting ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
