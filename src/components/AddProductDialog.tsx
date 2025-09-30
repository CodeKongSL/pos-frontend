import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { CategoryService } from "./category/services/category.service";
import { Category } from "./category/models/category.model";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateCategoryDialog } from "./CreateCategoryDialog";
import { CreateBrandDialog } from "./CreateBrandDialog";
import { SubcategorySelectionDialog } from "./SubcategorySelectionDialog";
import { SelectedSubcategoriesDisplay } from "./SelectedSubcategoriesDisplay";



import { Brand } from "./brand/models/brand.model";
import { BrandService } from "./brand/services/brand.service";
import { ProductService } from "./product/services/product.service";

interface SubcategoryData {
  subcategoryId: string;
  subcategoryName: string;
  quantity: number;
  expiryDate: string;
  price: number;
}

interface AddProductDialogProps {
  children: React.ReactNode;
}

export function AddProductDialog({ children }: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      console.log('Fetching categories and brands...');
      const [categoriesRes, brandsRes] = await Promise.all([
        CategoryService.getAllCategories(),
        BrandService.getAllBrands()
      ]);
      console.log('Categories received:', categoriesRes);
      console.log('Brands received:', brandsRes);
      setCategories(categoriesRes);
      setBrands(brandsRes);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);
  const [formData, setFormData] = useState({
    category: "",
    brand: "",
    description: "",
  });
  const [selectedSubcategories, setSelectedSubcategories] = useState<SubcategoryData[]>([]);

  // Open subcategory dialog when brand changes
  useEffect(() => {
    if (formData.brand) {
      setSubcategoryDialogOpen(true);
    }
  }, [formData.brand]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Prepare product data
      const productData = {
        categoryId: formData.category,
        brandId: formData.brand,
        description: formData.description,
        productSubcategories: selectedSubcategories.map(sub => ({
          subcategoryId: sub.subcategoryId,
          quantity: sub.quantity,
          expiryDate: sub.expiryDate,
          price: sub.price
        }))
      };
      
      console.log("Creating product:", productData);
      
      // Create product
      await ProductService.createProduct(productData);
      
      console.log("Product created successfully");
      
      // Reset form and close dialog
      setFormData({
        category: "",
        brand: "",
        description: "",
      });
      setSelectedSubcategories([]);
      setOpen(false);
    } catch (error) {
      console.error("Failed to create product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    // Clear brand and subcategories when category changes
    setSelectedSubcategories([]);
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      brand: "", // Reset brand when category changes
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
    return brands.find(brand => brand.brandId === formData.brand)?.name || "";
  };

  const getTotalStock = () => {
    return selectedSubcategories.reduce((total, sub) => total + sub.quantity, 0);
  };

  const isFormValid = () => {
    return formData.category && 
           formData.brand && 
           selectedSubcategories.length > 0;
  };

  // Check if category is selected to enable other fields
  const isCategorySelected = Boolean(formData.category);

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
              <Label htmlFor="category">Category *</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.categoryId} value={category.categoryId}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <CreateCategoryDialog onCategoryCreated={() => {
                    console.log('Category created, refreshing list...');
                    fetchData();
                  }}>
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
                  disabled={!isCategorySelected}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={isCategorySelected ? "Select a brand" : "Select category first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.brandId} value={brand.brandId}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <CreateBrandDialog 
                  categoryId={formData.category}
                  onBrandCreated={() => {
                    console.log('Brand created, refreshing list...');
                    fetchData();
                  }}>
                  <Button type="button" variant="outline" size="sm" disabled={!isCategorySelected}>
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
                placeholder={isCategorySelected ? "Enter product description (optional)" : "Select category first"}
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                disabled={!isCategorySelected}
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