import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateCategoryDialog } from "./CreateCategoryDialog";
import { CreateBrandDialog } from "./CreateBrandDialog";
import { SubcategorySelectionDialog } from "./SubcategorySelectionDialog";
import { SelectedSubcategoriesDisplay } from "./SelectedSubcategoriesDisplay";

// Dummy categories data
const categories = [
  { id: "1", name: "Beverages" },
  { id: "2", name: "Dairy Products" },
  { id: "3", name: "Household Essentials" },
  { id: "4", name: "Personal Care" },
  { id: "5", name: "Snacks & Confectionery" },
];

// Dummy brands data
const brands = [
  { id: "1", name: "Coca-Cola" },
  { id: "2", name: "Anchor" },
  { id: "3", name: "Dettol" },
  { id: "4", name: "Sunlight" },
  { id: "5", name: "Milo" },
];

interface SubcategoryData {
  subcategoryId: string;
  subcategoryName: string;
  quantity: number;
  expiryDate: string;
}

interface AddProductDialogProps {
  children: React.ReactNode;
}

export function AddProductDialog({ children }: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    brand: "",
    description: "",
  });
  const [selectedSubcategories, setSelectedSubcategories] = useState<SubcategoryData[]>([]);

  // Auto-open subcategory dialog when brand is selected
  useEffect(() => {
    if (formData.brand && !subcategoryDialogOpen) {
      setSubcategoryDialogOpen(true);
    }
  }, [formData.brand, subcategoryDialogOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate total stock from subcategories
    const totalStock = selectedSubcategories.reduce((total, sub) => total + sub.quantity, 0);
    
    // Prepare product data
    const productData = {
      ...formData,
      stock: totalStock,
      subcategories: selectedSubcategories,
    };
    
    console.log("Product data:", productData);
    
    // Reset form and close dialog
    setFormData({
      name: "",
      price: "",
      category: "",
      brand: "",
      description: "",
    });
    setSelectedSubcategories([]);
    setOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBrandChange = (brandId: string) => {
    // Clear existing subcategories when brand changes
    setSelectedSubcategories([]);
    setFormData(prev => ({
      ...prev,
      brand: brandId
    }));
  };

  const handleSubcategorySelect = (subcategoryData: SubcategoryData) => {
    // Check if subcategory already exists
    const existingIndex = selectedSubcategories.findIndex(
      sub => sub.subcategoryId === subcategoryData.subcategoryId
    );

    if (existingIndex >= 0) {
      // Update existing subcategory
      setSelectedSubcategories(prev => 
        prev.map((sub, index) => 
          index === existingIndex ? subcategoryData : sub
        )
      );
    } else {
      // Add new subcategory
      setSelectedSubcategories(prev => [...prev, subcategoryData]);
    }

    setSubcategoryDialogOpen(false);
  };

  const handleRemoveSubcategory = (subcategoryId: string) => {
    setSelectedSubcategories(prev => 
      prev.filter(sub => sub.subcategoryId !== subcategoryId)
    );
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset everything when closing main dialog
      setFormData({
        name: "",
        price: "",
        category: "",
        brand: "",
        description: "",
      });
      setSelectedSubcategories([]);
      setSubcategoryDialogOpen(false);
    }
    setOpen(newOpen);
  };

  const getSelectedBrandName = () => {
    return brands.find(brand => brand.id === formData.brand)?.name || "";
  };

  const getTotalStock = () => {
    return selectedSubcategories.reduce((total, sub) => total + sub.quantity, 0);
  };

  const isFormValid = () => {
    return formData.name && 
           formData.price && 
           formData.category && 
           formData.brand && 
           selectedSubcategories.length > 0;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <CreateCategoryDialog>
                  <Button type="button" variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </CreateCategoryDialog>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.brand}
                  onValueChange={handleBrandChange}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <CreateBrandDialog>
                  <Button type="button" variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </CreateBrandDialog>
              </div>
            </div>

            {/* Selected Subcategories Display */}
            {selectedSubcategories.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Product Variants ({selectedSubcategories.length})</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSubcategoryDialogOpen(true)}
                    disabled={!formData.brand}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Variant
                  </Button>
                </div>
                <SelectedSubcategoriesDisplay
                  subcategories={selectedSubcategories}
                  brandName={getSelectedBrandName()}
                  onRemove={handleRemoveSubcategory}
                />
              </div>
            )}

            {/* Total Stock Display */}
            {selectedSubcategories.length > 0 && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Stock Quantity:</span>
                  <span className="text-lg font-bold text-primary">{getTotalStock()} units</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter product description (optional)"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary-hover"
                disabled={!isFormValid()}
              >
                Add Product
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Subcategory Selection Dialog */}
      <SubcategorySelectionDialog
        open={subcategoryDialogOpen}
        onOpenChange={setSubcategoryDialogOpen}
        brandId={formData.brand}
        onSubcategorySelect={handleSubcategorySelect}
      />
    </>
  );
}