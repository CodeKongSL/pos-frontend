import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Award, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BrandService } from "../components/brand/services/brand.service";
import { Brand } from "../components/brand/models/brand.model";
import BrandProductsModal from "../components/BrandProductsModal";

// Display brand interface for the UI
interface DisplayBrand {
  id: string;
  name: string;
  productCount: number;
  revenue: string;
  status: string;
}

export default function Brands() {
  const [searchTerm, setSearchTerm] = useState("");
  const [brands, setBrands] = useState<DisplayBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<{ id: string; name: string } | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await BrandService.getAllBrands();
      
      // Fetch product counts for each brand
      const displayBrandsPromises = data
        .filter(brand => !brand.deleted)
        .map(async (brand) => {
          try {
            const products = await BrandService.getProductsByBrandId(brand.brandId);
            return {
              id: brand.brandId,
              name: brand.name,
              productCount: products.length,
              revenue: "Rs. 0.00", // Keep as placeholder
              status: "Active"
            };
          } catch (err) {
            console.error(`Error fetching products for brand ${brand.brandId}:`, err);
            return {
              id: brand.brandId,
              name: brand.name,
              productCount: 0,
              revenue: "Rs. 0.00",
              status: "Active"
            };
          }
        });

      const displayBrands = await Promise.all(displayBrandsPromises);
      
      // Calculate total products across all brands
      const total = displayBrands.reduce((sum, brand) => sum + brand.productCount, 0);
      setTotalProducts(total);
      
      setBrands(displayBrands);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (brandId: string, brandName: string) => {
    if (!confirm(`Are you sure you want to delete "${brandName}"?`)) {
      return;
    }

    try {
      await BrandService.deleteBrand(brandId);
      // Refresh the brands list after successful deletion
      await fetchBrands();
    } catch (err) {
      alert('Error deleting brand: ' + (err instanceof Error ? err.message : 'An error occurred'));
      console.error('Error deleting brand:', err);
    }
  };

  const handleViewProducts = (brandId: string, brandName: string) => {
    setSelectedBrand({ id: brandId, name: brandName });
  };

  const handleCloseModal = () => {
    setSelectedBrand(null);
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading brands...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Error: {error}</p>
          <Button onClick={fetchBrands}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Brands</h1>
          <p className="text-muted-foreground mt-1">Manage product brands and manufacturers</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{brands.length}</p>
                <p className="text-sm text-muted-foreground">Total Brands</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-accent">{totalProducts}</p>
                <p className="text-sm text-muted-foreground">Branded Products</p>
              </div>
              <Package className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">Rs. 113,750</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
              <Award className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Brands Grid */}
      {filteredBrands.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {searchTerm ? 'No brands found matching your search.' : 'No brands available.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBrands.map((brand) => (
            <Card key={brand.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{brand.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBrand(brand.id, brand.name);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Products</p>
                    <p className="font-semibold">{brand.productCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Revenue</p>
                    <p className="font-semibold text-accent">{brand.revenue}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-success text-success-foreground">
                    {brand.status}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProducts(brand.id, brand.name);
                    }}
                  >
                    View Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Brand Performance</p>
                  <p className="text-sm text-muted-foreground">View detailed brand analytics</p>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-accent/10">
                  <Package className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Brand Report</p>
                  <p className="text-sm text-muted-foreground">Generate brand-wise sales report</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Modal */}
      {selectedBrand && (
        <BrandProductsModal
          brandId={selectedBrand.id}
          brandName={selectedBrand.name}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}