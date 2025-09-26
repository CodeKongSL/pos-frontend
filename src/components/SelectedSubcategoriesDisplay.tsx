import { X, Package, Calendar, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SubcategoryData {
  subcategoryId: string;
  subcategoryName: string;
  quantity: number;
  expiryDate: string;
}

interface SelectedSubcategoriesDisplayProps {
  subcategories: SubcategoryData[];
  brandName: string;
  onRemove: (subcategoryId: string) => void;
}

export function SelectedSubcategoriesDisplay({
  subcategories,
  brandName,
  onRemove
}: SelectedSubcategoriesDisplayProps) {
  if (subcategories.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTotalQuantity = () => {
    return subcategories.reduce((total, sub) => total + sub.quantity, 0);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Selected {brandName} Products</h4>
        <Badge variant="secondary" className="text-xs">
          {subcategories.length} variant{subcategories.length !== 1 ? 's' : ''} • Total: {getTotalQuantity()} units
        </Badge>
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {subcategories.map((subcategory) => (
          <Card key={subcategory.subcategoryId} className="relative">
            <CardContent className="p-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(subcategory.subcategoryId)}
              >
                <X className="h-3 w-3" />
              </Button>
              
              <div className="pr-8">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-primary/10 mt-0.5">
                    <Package className="h-3 w-3 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{subcategory.subcategoryName}</span>
                      <Badge variant="outline" className="text-xs">
                        {brandName}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        <span>{subcategory.quantity} units</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Exp: {formatDate(subcategory.expiryDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}