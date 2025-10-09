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
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching categories and brands...');
      const [categoriesRes, brandsRes] = await Promise.all([
        CategoryService.getCategoriesOnly(),
        BrandService.getAllBrands()
      ]);
      console.log('Categories received:', categoriesRes);
      console.log('Brands received:', brandsRes);
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
      setBrands(Array.isArray(brandsRes) ? brandsRes : []);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    category: "",
    brand: "",
    description: "",
    costPrice: "",
    sellingPrice: "",
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
      // Format the product name to include brand and subcategory
      const selectedBrand = brands.find(b => b.brandId === formData.brand);
      const brandName = selectedBrand?.name || "";
      const firstSubcategory = selectedSubcategories[0];
      // Only use the formData.name if there's no subcategory
      const formattedName = firstSubcategory ? `${brandName} - ${firstSubcategory.subcategoryName}` : formData.name;
      // Calculate total stock quantity from all subcategories
      const stockQty = selectedSubcategories.reduce((total, sub) => total + sub.quantity, 0);

      // Format expiry date to RFC3339/ISO8601
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toISOString(); // This will output in format: "2025-10-23T00:00:00.000Z"
      };

      // Prepare product data
      const productData = {
        name: formattedName,
        categoryId: formData.category,
        brandId: formData.brand,
        description: formData.description,
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        stockQty: stockQty,
        subCategoryId: selectedSubcategories[0]?.subcategoryId || "", // Use first subcategory's ID
        barcode: formData.barcode || undefined,
        expiry_date: selectedSubcategories[0]?.expiryDate ? formatDate(selectedSubcategories[0].expiryDate) : undefined,
        productSubcategories: selectedSubcategories.map(sub => ({
          subcategoryId: sub.subcategoryId,
          quantity: sub.quantity,
          expiryDate: formatDate(sub.expiryDate),
          price: sub.price
        }))
      };
      
      console.log("Creating product:", productData);
      
      // Create product
      await ProductService.createProduct(productData);
      
      console.log("Product created successfully");
      
      // Reset form and close dialog
      setFormData({
        name: "",
        barcode: "",
        category: "",
        brand: "",
        description: "",
        costPrice: "",
        sellingPrice: "",
      });
      setSelectedSubcategories([]);
      setOpen(false);
    } catch (error) {
      console.error("Failed to create product:", error);
      setError(error instanceof Error ? error.message : 'Failed to create product');
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
    setSelectedSubcategories([]); // Clear selected subcategories
    setFormData(prev => ({
      ...prev,
      brand: brandId
    }));
    // Reset the subcategory dialog state
    setSubcategoryDialogOpen(false); // Close the dialog first
    // The useEffect will trigger it to open again with the new brand
  };

  const handleSubcategorySelect = (subcategoryData: SubcategoryData) => {
    // First validate that we have a selected brand
    if (!formData.brand) {
      console.error("No brand selected");
      return;
    }

    const brandName = getSelectedBrandName();

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

    // Auto-generate product name from brand and subcategory
    const generatedName = subcategoryData ? `${brandName} - ${subcategoryData.subcategoryName}`.trim() : brandName;
    
    // Use unit price instead of total cost
    const unitPrice = subcategoryData.price.toFixed(2);

    // Update form with generated name and unit price
    setFormData(prev => ({
      ...prev,
      name: generatedName,
      costPrice: unitPrice
    }));


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
        barcode: "",
        category: "",
        brand: "",
        description: "",
        costPrice: "",
        sellingPrice: "",
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
    return formData.name &&
           formData.category && 
           formData.brand && 
           formData.costPrice &&
           formData.sellingPrice &&
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
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mt-2">
                {error}
              </div>
            )}
            {isLoading && (
              <div className="bg-muted/50 text-muted-foreground text-sm p-3 rounded-md mt-2 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Loading...
              </div>
            )}
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
                    {categories.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No categories available
                      </div>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.categoryId} value={category.categoryId}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
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
                    {brands.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No brands available
                      </div>
                    ) : (
                      brands.map((brand) => (
                        <SelectItem key={brand.brandId} value={brand.brandId}>
                          {brand.name}
                        </SelectItem>
                      ))
                    )}
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

            {/* Totals Display */}
            {selectedSubcategories.length > 0 && (
              <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Stock Quantity:</span>
                  <span className="text-lg font-bold text-primary">{getTotalStock()} units</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Cost Price:</span>
                  <span className="text-lg font-bold text-primary">
                    Rs. {Number(formData.costPrice).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Expected Total Sales:</span>
                  <span className="text-lg font-bold text-green-600">
                    Rs. {(getTotalStock() * Number(formData.sellingPrice)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Expected Profit:</span>
                  <span className="text-lg font-bold text-emerald-600">
                    Rs. {((getTotalStock() * Number(formData.sellingPrice)) - Number(formData.costPrice)).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <input
                type="text"
                id="name"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Auto-generated from brand and subcategory"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={true}
                title="Name is automatically generated from brand and subcategory"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode (Optional)</Label>
              <input
                type="text"
                id="barcode"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter barcode"
                value={formData.barcode}
                onChange={(e) => handleInputChange("barcode", e.target.value)}
                disabled={!isCategorySelected}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Unit Price *</Label>
                <input
                  type="number"
                  id="costPrice"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Auto-filled with subcategory unit price"
                  value={formData.costPrice}
                  onChange={(e) => handleInputChange("costPrice", e.target.value)}
                  disabled={true}
                  min="0"
                  step="0.01"
                  title="This is the unit cost per item, auto-filled from subcategory"
                />

              </div>

              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price *</Label>
                <input
                  type="number"
                  id="sellingPrice"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter selling price"
                  value={formData.sellingPrice}
                  onChange={(e) => handleInputChange("sellingPrice", e.target.value)}
                  disabled={!isCategorySelected}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

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