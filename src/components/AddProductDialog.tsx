import { useState } from "react";
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

interface AddProductDialogProps {
  children: React.ReactNode;
}

export function AddProductDialog({ children }: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Product data:", formData);
    // Reset form and close dialog
    setFormData({
      name: "",
      price: "",
      stock: "",
      category: "",
      brand: "",
      description: "",
    });
    setOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
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

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                required
              />
            </div>
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
            <Label htmlFor="brand">Brand</Label>
            <div className="flex gap-2">
              <Select
                value={formData.brand}
                onValueChange={(value) => handleInputChange("brand", value)}
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
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-hover">
              Add Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}