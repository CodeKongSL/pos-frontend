import { useState } from "react";
import { Package, Calendar, Hash, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Dummy subcategories data for each brand
const brandSubcategories = {
  "1": { // Coca-Cola
    brandName: "Coca-Cola",
    subcategories: [
      { id: "cc-1l", name: "1L", description: "1 Liter bottle" },
      { id: "cc-15l", name: "1.5L", description: "1.5 Liter bottle" },
      { id: "cc-2l", name: "2L", description: "2 Liter bottle" }
    ]
  },
  "2": { // Anchor
    brandName: "Anchor",
    subcategories: [
      { id: "an-400g", name: "400g", description: "400 gram pack" },
      { id: "an-900g", name: "900g", description: "900 gram pack" },
      { id: "an-1kg", name: "1kg", description: "1 kilogram pack" }
    ]
  },
  "3": { // Dettol
    brandName: "Dettol",
    subcategories: [
      { id: "dt-200ml", name: "200ml", description: "200ml bottle" },
      { id: "dt-500ml", name: "500ml", description: "500ml bottle" },
      { id: "dt-1l", name: "1L", description: "1 Liter bottle" }
    ]
  },
  "4": { // Sunlight
    brandName: "Sunlight",
    subcategories: [
      { id: "sl-100g", name: "100g", description: "100 gram bar" },
      { id: "sl-200g", name: "200g", description: "200 gram bar" },
      { id: "sl-500g", name: "500g", description: "500 gram pack" }
    ]
  },
  "5": { // Milo
    brandName: "Milo",
    subcategories: [
      { id: "ml-200ml", name: "200ml", description: "200ml tetra pack" },
      { id: "ml-400g", name: "400g", description: "400 gram tin" },
      { id: "ml-900g", name: "900g", description: "900 gram tin" }
    ]
  }
};

interface SubcategorySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId: string;
  onSubcategorySelect: (subcategoryData: {
    subcategoryId: string;
    subcategoryName: string;
    quantity: number;
    expiryDate: string;
    price: number;
  }) => void;
}

export function SubcategorySelectionDialog({
  open,
  onOpenChange,
  brandId,
  onSubcategorySelect
}: SubcategorySelectionDialogProps) {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const brandData = brandSubcategories[brandId as keyof typeof brandSubcategories];

  const resetForm = () => {
    setSelectedSubcategory("");
    setQuantity("");
    setExpiryDate("");
    setPrice("");
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedSubcategory) {
      setError("Please select a subcategory");
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      setError("Please enter a valid price");
      return;
    }

    if (!expiryDate) {
      setError("Please select an expiry date");
      return;
    }

    // Find selected subcategory name
    const subcategory = brandData.subcategories.find(sub => sub.id === selectedSubcategory);
    
    onSubcategorySelect({
      subcategoryId: selectedSubcategory,
      subcategoryName: subcategory?.name || "",
      quantity: parseInt(quantity),
      expiryDate,
      price: parseFloat(price)
    });

    // Reset form and close dialog
    resetForm();
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    // Clear other fields when changing subcategory
    if (selectedSubcategory !== subcategoryId) {
      setQuantity("");
      setExpiryDate("");
      setPrice("");
      setError(null);
    }
  };

  if (!brandData) {
    return null;
  }

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Select {brandData.brandName} Subcategory
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Subcategory Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Choose Size/Type *</Label>
            <div className="grid gap-3">
              {brandData.subcategories.map((subcategory) => (
                <Card
                  key={subcategory.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedSubcategory === subcategory.id
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleSubcategorySelect(subcategory.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{subcategory.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {subcategory.description}
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedSubcategory === subcategory.id
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground'
                      }`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Additional Fields - Only show when subcategory is selected */}
          {selectedSubcategory && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium text-lg">Product Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Quantity *
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="Enter quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Price *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Expiry Date *
                </Label>
                <Input
                  id="expiryDate"
                  type="date"
                  min={today}
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary-hover"
              disabled={!selectedSubcategory}
            >
              Add to Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}