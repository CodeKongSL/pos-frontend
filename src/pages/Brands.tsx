import { useState } from "react";
import { Search, Plus, Edit, Trash2, Award, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const brands = [
  { id: "1", name: "Coca-Cola", productCount: 15, revenue: "Rs. 45,500.00", status: "Active" },
  { id: "2", name: "Anchor", productCount: 8, revenue: "Rs. 28,200.00", status: "Active" },
  { id: "3", name: "Sunlight", productCount: 12, revenue: "Rs. 18,750.00", status: "Active" },
  { id: "4", name: "Lifebuoy", productCount: 6, revenue: "Rs. 12,400.00", status: "Active" },
  { id: "5", name: "Milo", productCount: 4, revenue: "Rs. 8,900.00", status: "Active" },
];

export default function Brands() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <p className="text-2xl font-bold text-accent">45</p>
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
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive-foreground hover:bg-destructive">
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
                <Button variant="outline" size="sm">
                  View Products
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
    </div>
  );
}