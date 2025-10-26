import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CustomerReturn, ReturnItem } from "@/types/return";
import { useState } from "react";
import ReturnProductSelectionDialog from "./ReturnProductSelectionDialog";
import { returnService } from "./returns/services/return.service";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";

interface ReturnFormDialogProps {
    onSuccess?: () => void;
}

export function ReturnFormDialog({ onSuccess }: ReturnFormDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<ReturnItem[]>([]);
    const [customerName, setCustomerName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [billNumber, setBillNumber] = useState("");
    const [notes, setNotes] = useState("");
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!customerName || selectedProducts.length === 0) return;

        setIsSubmitting(true);
        try {
            // Transform selectedProducts to match API format
            const products = selectedProducts.map(item => ({
                productId: item.product.productId,
                amount: item.quantity,
                reason: item.condition // Use dropdown value only
            }));

            // Build payload
            const payload: any = {
                customerName,
                contactNumber,
                products
            };
            if (billNumber) payload.originalBillNumber = billNumber;
            if (notes) payload.additionalNotes = notes;

            // Use direct fetch to the new API endpoint
            const response = await fetch("https://my-go-backend.onrender.com/returns", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error("Failed to submit return request");
            }

            toast({
                title: "Success",
                description: "Return request submitted successfully",
            });

            // Reset form
            setCustomerName("");
            setContactNumber("");
            setBillNumber("");
            setNotes("");
            setSelectedProducts([]);
            setIsOpen(false);

            // Callback to refresh parent component
            onSuccess?.();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to submit return request",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>New Return</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>New Customer Return</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="customerName">Customer Name</Label>
                            <Input 
                                id="customerName" 
                                placeholder="Enter customer name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactNumber">Contact Number</Label>
                            <Input 
                                id="contactNumber" 
                                placeholder="Enter contact number"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="billNumber">Original Bill Number</Label>
                        <Input 
                            id="billNumber" 
                            placeholder="Enter bill number"
                            value={billNumber}
                            onChange={(e) => setBillNumber(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Products</Label>
                        <ReturnProductSelectionDialog
                            onProductSelect={(product) => {
                                setSelectedProducts([
                                    ...selectedProducts,
                                    {
                                        product,
                                        quantity: 1,
                                        reason: "",
                                        condition: "unwanted"
                                    }
                                ]);
                            }}
                        />

                        {/* Selected Products List */}
                        <div className="space-y-4 mt-4">
                            {selectedProducts.map((item, index) => (
                                <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{item.product.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            ID: {item.product.productId}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    const newProducts = [...selectedProducts];
                                                    newProducts[index].quantity = parseInt(e.target.value);
                                                    setSelectedProducts(newProducts);
                                                }}
                                            />
                                            <Select
                                                value={item.condition}
                                                onValueChange={(value: ReturnItem['condition']) => {
                                                    const newProducts = [...selectedProducts];
                                                    newProducts[index].condition = value;
                                                    setSelectedProducts(newProducts);
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="damaged">Damaged</SelectItem>
                                                    <SelectItem value="defective">Defective</SelectItem>
                                                    <SelectItem value="unwanted">Unwanted</SelectItem>
                                                    <SelectItem value="wrong-item">Wrong Item</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {/* Removed free-text reason textarea */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea 
                            id="notes" 
                            placeholder="Enter any additional notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSubmit}
                            disabled={isSubmitting || !customerName || selectedProducts.length === 0}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Return"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}