import { useState } from "react";
import { SubcategoryService } from "./subcategory/services/subcategory.service";
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

interface CreateSubcategoryDialogProps {
  children: React.ReactNode;
  brandId: string;
  brandName: string;
  onSubcategoryCreated?: () => void;
}

interface SubcategoryFormData {
  name: string;
}

export function CreateSubcategoryDialog({ children, brandId, brandName, onSubcategoryCreated }: CreateSubcategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<SubcategoryFormData>({
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
      console.log('Creating new subcategory:', { name: trimmedName, brandId });
      if (!trimmedName) {
        throw new Error('Subcategory name is required');
      }
      const newSubcategory = await SubcategoryService.createSubcategory({
        subcategoryName: trimmedName,
        brandId: brandId
      });
      console.log('Subcategory created successfully:', newSubcategory);

      // Show success state
      setSuccess(true);
      
      // Reset form after a short delay and close dialog
      setTimeout(() => {
        setFormData({ name: "" });
        setSuccess(false);
        setOpen(false);
        // Trigger refresh of subcategories list
        if (onSubcategoryCreated) {
          console.log('Triggering subcategory list refresh...');
          onSubcategoryCreated();
        } else {
          console.warn('No onSubcategoryCreated callback provided');
        }
      }, 1500);

    } catch (err) {
      setError("Failed to create subcategory. Please try again.");
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
        aria-describedby="subcategory-dialog-description"
      >
        <DialogHeader>
          <DialogTitle>Create New Subcategory</DialogTitle>
          <p id="subcategory-dialog-description" className="text-sm text-muted-foreground">
            Create a new subcategory for {brandName}
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
              Subcategory Created Successfully!
            </h3>
            <p className="text-sm text-gray-500">
              "{formData.name}" has been added as a subcategory of {brandName}.
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
              <Label htmlFor="subcategoryName">Subcategory Name *</Label>
              <Input
                id="subcategoryName"
                placeholder="e.g. 500ml, 1L, 2L"
                value={formData.name}
                onChange={(e) => handleInputChange(e.target.value)}
                disabled={isLoading}
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter a size or variant name for this brand
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
                  "Create Subcategory"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}