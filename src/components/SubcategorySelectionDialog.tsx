import { useState, useEffect } from "react";
import { Package, Calendar, Hash, DollarSign, Plus } from "lucide-react";
import { SubcategoryService } from "./subcategory/services/subcategory.service";
import { BrandService } from "./brand/services/brand.service";
import { Brand } from "./brand/models/brand.model";
import { Subcategory } from "./subcategory/models/subcategory.model";
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

import { CreateSubcategoryDialog } from "./CreateSubcategoryDialog";

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
  const [brand, setBrand] = useState<Brand | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrandAndSubcategories = async () => {
      if (brandId) {
        setIsLoading(true);
        try {
          // Reset selection state when brand changes
          setSelectedSubcategory('');
          setQuantity('');
          setExpiryDate('');
          setPrice('');
          setError(null);
          
          // Fetch brand details
          const allBrands = await BrandService.getAllBrands();
          const selectedBrand = allBrands.find(b => b.brandId === brandId);
          console.log('Selected brand:', selectedBrand);
          setBrand(selectedBrand || null);

          // Fetch subcategories
          const allSubcategories = await SubcategoryService.getAllSubcategories();
          console.log('All subcategories:', allSubcategories);
          console.log('Current brandId:', brandId);
          
          const brandSubcategories = allSubcategories.filter(s => {
            const matches = s.brandId === brandId;
            console.log(`Subcategory: ${s.name} (${s.subcategoryId}), brandId: ${s.brandId}, matches current brand: ${matches}`);
            return matches;
          });
          
          console.log('Filtered subcategories for brand:', brandSubcategories);
          setSubcategories(brandSubcategories);
        } catch (err) {
          console.error('Error fetching brand and subcategories:', err);
          setError('Failed to load brand data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchBrandAndSubcategories();
  }, [brandId]);

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
    const subcategory = subcategories.find(sub => sub.subcategoryId === selectedSubcategory);
    
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
    console.log('handleSubcategorySelect called with:', { 
      subcategoryId, 
      type: typeof subcategoryId,
      subcategories: subcategories.map(s => ({
        id: s.subcategoryId || (s as any).subCategoryId,
        name: s.name,
        originalObject: s
      }))
    });
    
    if (!subcategoryId) {
      console.error('Invalid subcategoryId received:', subcategoryId);
      return;
    }

    // Verify the subcategory exists in our current list
    const subcategory = subcategories.find(s => 
      (s.subcategoryId === subcategoryId) || ((s as any).subCategoryId === subcategoryId)
    );
    if (!subcategory) {
      console.error('Selected subcategoryId not found in current subcategories list:', {
        searchedId: subcategoryId,
        availableIds: subcategories.map(s => ({
          subcategoryId: s.subcategoryId,
          subCategoryId: (s as any).subCategoryId
        }))
      });
      return;
    }

    console.log('Found subcategory:', subcategory);
    
    // Toggle selection if clicking the same subcategory
    if (selectedSubcategory === subcategoryId) {
      setSelectedSubcategory('');
      setQuantity('');
      setExpiryDate('');
      setPrice('');
      setError(null);
    } else {
      // Select new subcategory
      setSelectedSubcategory(subcategoryId);
      // Clear other fields when changing subcategory
      setQuantity('');
      setExpiryDate('');
      setPrice('');
      setError(null);
    }

    console.log('Updated selected subcategory:', subcategoryId);
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  const handleSubcategoryCreated = () => {
    // Refresh subcategories list
    const fetchSubcategories = async () => {
      try {
        const allSubcategories = await SubcategoryService.getAllSubcategories();
        const brandSubcategories = allSubcategories.filter(s => s.brandId === brandId);
        setSubcategories(brandSubcategories);
      } catch (err) {
        console.error('Error fetching subcategories:', err);
      }
    };
    fetchSubcategories();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Select {brand?.name || ''} Subcategory
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
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Choose Size/Type *</Label>
              {brand && (
                <CreateSubcategoryDialog
                  brandId={brand.brandId}
                  brandName={brand.name}
                  onSubcategoryCreated={handleSubcategoryCreated}
                >
                  <Button type="button" variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Size/Type
                  </Button>
                </CreateSubcategoryDialog>
              )}
            </div>
            <div className="grid gap-3">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading subcategories...</p>
                </div>
              ) : subcategories.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">No subcategories found</p>
                  {brand && (
                    <CreateSubcategoryDialog
                      brandId={brand.brandId}
                      brandName={brand.name}
                      onSubcategoryCreated={handleSubcategoryCreated}
                    >
                      <Button type="button" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add your first subcategory
                      </Button>
                    </CreateSubcategoryDialog>
                  )}
                </div>
              ) : (
                subcategories.map((subcategory) => (
                  <div key={subcategory.subcategoryId}>
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedSubcategory === (subcategory.subcategoryId || (subcategory as any).subCategoryId)
                          ? 'ring-2 ring-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        console.log('Clicked subcategory object:', subcategory);
                        // Handle both possible property names
                        const id = subcategory.subcategoryId || (subcategory as any).subCategoryId;
                        console.log('Extracted ID:', id);
                        if (id) {
                          handleSubcategorySelect(id);
                        } else {
                          console.error('No subcategoryId found in object:', subcategory);
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{subcategory.name}</h4>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedSubcategory === subcategory.subcategoryId
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground'
                          }`} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))
              )}
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
              disabled={!selectedSubcategory || !quantity || !price || !expiryDate}
            >
              Add to Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}