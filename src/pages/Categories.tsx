import { useState } from "react";
import { Search, Plus, Edit, Trash2, FolderOpen, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const categories = [
  { id: "1", name: "Beverages", productCount: 25, description: "Soft drinks, juices, and other beverages" },
  { id: "2", name: "Dairy Products", productCount: 18, description: "Milk, cheese, yogurt, and dairy items" },
  { id: "3", name: "Household Essentials", productCount: 32, description: "Cleaning supplies and household items" },
  { id: "4", name: "Personal Care", productCount: 22, description: "Health and beauty products" },
  { id: "5", name: "Snacks", productCount: 28, description: "Chips, crackers, and snack foods" },
];

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Categories</h1>
          <p className="text-muted-foreground mt-1">Organize products into categories</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Total Categories</p>
              </div>
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-accent">125</p>
                <p className="text-sm text-muted-foreground">Categorized Products</p>
              </div>
              <Tag className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">15</p>
                <p className="text-sm text-muted-foreground">Uncategorized</p>
              </div>
              <FolderOpen className="h-8 w-8 text-success" />
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
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
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
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{category.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-primary border-primary">
                  {category.productCount} Products
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
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Bulk Category Assignment</p>
                  <p className="text-sm text-muted-foreground">Assign multiple products to categories</p>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-accent/10">
                  <FolderOpen className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Category Report</p>
                  <p className="text-sm text-muted-foreground">Generate category-wise sales report</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}