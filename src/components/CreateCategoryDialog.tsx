import { useState } from "react";
import { CategoryService } from "./category/services/category.service";
import { Category } from "./category/models/category.model";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateCategoryDialogProps {
  children: React.ReactNode;
  onCategoryCreated?: () => void;
}

interface CategoryFormData {
  name: string;
}

export function CreateCategoryDialog({ children, onCategoryCreated }: CreateCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const trimmedName = formData.name.trim();
      console.log('Creating new category with name:', trimmedName);
      if (!trimmedName) {
        throw new Error('Category name is required');
      }
      const newCategory = await CategoryService.createCategory({
        categoryName: trimmedName,
      });
      console.log('Category created successfully:', newCategory);

      // Show success state
      setSuccess(true);
      
      // Reset form after a short delay and close dialog
      setTimeout(() => {
        setFormData({ name: "" });
        setSuccess(false);
        setOpen(false);
        // Trigger refresh of categories list
        if (onCategoryCreated) {
          console.log('Triggering category list refresh...');
          onCategoryCreated();
        } else {
          console.warn('No onCategoryCreated callback provided');
        }
      }, 1500);

    } catch (err) {
      setError("Failed to create category. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setFormData({ name: value });
    // Clear any existing errors when user starts typing
    if (error) setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setFormData({ name: "" });
      setError(null);
      setSuccess(false);
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[400px]" 
        aria-describedby="category-dialog-description"
      >
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <p id="category-dialog-description" className="text-sm text-muted-foreground">
            Create a new category in your inventory system
          </p>
        </DialogHeader>
        
        {success ? (
          <div className="py-8 text-center">
            <div className="mb-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Category Created Successfully!
            </h3>
            <p className="text-sm text-gray-500">
              "{formData.name}" has been added to your categories.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name *</Label>
              <Input
                id="categoryName"
                placeholder="e.g. Beverages, Dairy Products"
                value={formData.name}
                onChange={(e) => handleInputChange(e.target.value)}
                disabled={isLoading}
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Choose a clear, descriptive name for your category
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary-hover"
                disabled={isLoading || !formData.name.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Category"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}