import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, RefreshCcw } from "lucide-react";
import { Product } from "@/components/product/models/product.model";
import { ProductService } from "@/components/product/services/product.service";
import { Category } from "@/components/category/models/category.model";
import { CategoryService } from "@/components/category/services/category.service";
import { Brand } from "@/components/brand/models/brand.model";
import { BrandService } from "@/components/brand/services/brand.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AddProductDialog } from "@/components/AddProductDialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DisplayProduct {
  productId: string;
  name: string;
  totalStock: number;
  categoryName: string;
  brandName: string;
}

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        ProductService.getAllProducts(),
        CategoryService.getAllCategories(),
        BrandService.getAllBrands()
      ]);
      
      setProducts(productsRes);
      setCategories(categoriesRes);
      setBrands(brandsRes);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getProductDisplayData = (product: Product): DisplayProduct => {
    const category = categories.find(c => c.categoryId === product.categoryId);
    const brand = brands.find(b => b.brandId === product.brandId);
    const totalStock = product.productSubcategories?.reduce((total, sub) => total + sub.quantity, 0) ?? 0;

    return {
      productId: product.productId,
      name: `${brand?.name || 'Unknown Brand'} ${category?.name || 'Unknown Category'}`,
      totalStock,
      categoryName: category?.name || 'Unknown Category',
      brandName: brand?.name || 'Unknown Brand'
    };
  };

  const filteredProducts = products
    .map(getProductDisplayData)
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brandName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getStatusBadge = (status: string, stock: number) => {
    if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock < 10) return <Badge variant="outline" className="text-warning border-warning">Low Stock</Badge>;
    return <Badge className="bg-success text-success-foreground">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Products</h1>
          <p className="text-muted-foreground mt-1">Manage your inventory and product catalog</p>
        </div>
        <AddProductDialog>
          <Button className="bg-primary hover:bg-primary-hover">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </AddProductDialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, category, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-sm text-muted-foreground">Loading products...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No products found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${product.totalStock < 10 ? 'text-warning' : 'text-foreground'}`}>
                        {product.totalStock}
                      </span>
                    </TableCell>
                    <TableCell>{product.categoryName}</TableCell>
                    <TableCell>{product.brandName}</TableCell>
                    <TableCell>{getStatusBadge("", product.totalStock)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive-foreground hover:bg-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Bulk Import</p>
                <p className="text-sm text-muted-foreground">Import products from CSV</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-accent/10">
                <Eye className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium">Generate Barcodes</p>
                <p className="text-sm text-muted-foreground">Create product barcodes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-success/10">
                <Trash2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium">Export Data</p>
                <p className="text-sm text-muted-foreground">Download product list</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}