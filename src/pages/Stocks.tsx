import { useState } from "react";
import { Search, Plus, AlertTriangle, Package, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const stockItems = [
  { id: "1", name: "Pepsi 500ml", currentStock: 20, minStock: 10, maxStock: 50, lastUpdated: "2025-01-20", status: "Normal" },
  { id: "2", name: "Milo 200ml", currentStock: 15, minStock: 8, maxStock: 40, lastUpdated: "2025-01-19", status: "Normal" },
  { id: "3", name: "Anchor Milk Powder 400g", currentStock: 8, minStock: 15, maxStock: 60, lastUpdated: "2025-01-18", status: "Low Stock" },
  { id: "4", name: "Sunlight Soap 100g", currentStock: 0, minStock: 5, maxStock: 30, lastUpdated: "2025-01-17", status: "Out of Stock" },
  { id: "5", name: "Lifebuoy Handwash 200ml", currentStock: 12, minStock: 10, maxStock: 35, lastUpdated: "2025-01-16", status: "Normal" },
];

export default function Stocks() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStocks = stockItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Normal":
        return <Badge className="bg-success text-success-foreground">Normal</Badge>;
      case "Low Stock":
        return <Badge variant="outline" className="text-warning border-warning">Low Stock</Badge>;
      case "Out of Stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStockPercentage = (current: number, max: number) => {
    return (current / max) * 100;
  };

  const lowStockCount = stockItems.filter(item => item.status === "Low Stock").length;
  const outOfStockCount = stockItems.filter(item => item.status === "Out of Stock").length;
  const normalStockCount = stockItems.filter(item => item.status === "Normal").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Stocks</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage inventory levels</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover">
          <Plus className="h-4 w-4 mr-2" />
          Stock Adjustment
        </Button>
      </div>

      {/* Stock Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{stockItems.length}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">{normalStockCount}</p>
                <p className="text-sm text-muted-foreground">Normal Stock</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-warning">{lowStockCount}</p>
                <p className="text-sm text-muted-foreground">Low Stock</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-destructive">{outOfStockCount}</p>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
              </div>
              <TrendingDown className="h-8 w-8 text-destructive" />
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
              placeholder="Search stock items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Levels ({filteredStocks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Min/Max</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocks.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <span className={`font-semibold ${
                      item.currentStock === 0 
                        ? 'text-destructive' 
                        : item.currentStock < item.minStock 
                        ? 'text-warning' 
                        : 'text-success'
                    }`}>
                      {item.currentStock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="w-24">
                      <Progress 
                        value={getStockPercentage(item.currentStock, item.maxStock)} 
                        className="h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {item.minStock} / {item.maxStock}
                    </span>
                  </TableCell>
                  <TableCell>{item.lastUpdated}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Adjust
                      </Button>
                      <Button variant="outline" size="sm">
                        History
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}