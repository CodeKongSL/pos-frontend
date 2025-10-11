import { useState } from "react";
import { BrandService } from "./brand/services/brand.service";
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateBrandDialogProps {
  children: React.ReactNode;
  categoryId: string;
  onBrandCreated?: (newBrand?: any) => void;
}

interface BrandFormData {
  name: string;
  description: string; // optional field for UI only
}

export function CreateBrandDialog({ children, categoryId, onBrandCreated }: CreateBrandDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<BrandFormData>({
    name: "",
    description: ""
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
      console.log('Creating new brand with name:', trimmedName);
      if (!trimmedName) {
        throw new Error('Brand name is required');
      }
      const newBrand = await BrandService.createBrand({
        name: trimmedName,
        categoryId: categoryId
      });
      console.log('Brand created successfully:', newBrand);

      // Show success state
      setSuccess(true);
      
      // Reset form after a short delay and close dialog
      setTimeout(() => {
        setFormData({ name: "", description: "" });
        setSuccess(false);
        setOpen(false);
        // Trigger refresh of brands list with the new brand data
        if (onBrandCreated) {
          console.log('Triggering brand list refresh with new brand:', newBrand);
          onBrandCreated(newBrand);
        } else {
          console.warn('No onBrandCreated callback provided');
        }
      }, 1000); // Reduced delay for better UX

    } catch (err) {
      setError("Failed to create brand. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof BrandFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear any existing errors when user starts typing
    if (error) setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setFormData({ name: "", description: "" });
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
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create New Brand</DialogTitle>
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
              Brand Created Successfully!
            </h3>
            <p className="text-sm text-gray-500">
              "{formData.name}" has been added to your brands.
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
              <Label htmlFor="brandName">Brand Name *</Label>
              <Input
                id="brandName"
                placeholder="e.g. Coca-Cola, Anchor, Dettol"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={isLoading}
                required
                autoFocus
              />
            </div>



            <div className="space-y-2">
              <Label htmlFor="brandDescription">Description</Label>
              <Textarea
                id="brandDescription"
                placeholder="Brief description about the brand (optional)"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Add any additional information about this brand
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
                  "Create Brand"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}