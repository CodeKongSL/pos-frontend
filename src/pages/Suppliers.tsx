import { useState } from "react";
import { Search, Plus, Edit, Trash2, MapPin, Phone, Mail, Package, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const suppliers = [
  { 
    id: "1", 
    name: "Cargills Distributors", 
    location: "Colombo", 
    contact: "+94 11 234 5678",
    email: "orders@cargills.lk",
    products: 25,
    lastDelivery: "2025-01-20",
    status: "Active",
    totalValue: "Rs. 125,000.00"
  },
  { 
    id: "2", 
    name: "Nestle Lanka", 
    location: "Kurunegala", 
    contact: "+94 37 222 3456",
    email: "supply@nestle.lk",
    products: 18,
    lastDelivery: "2025-01-19",
    status: "Active",
    totalValue: "Rs. 89,500.00"
  },
  { 
    id: "3", 
    name: "Hemas Holdings", 
    location: "Galle", 
    contact: "+94 91 234 7890",
    email: "orders@hemas.com",
    products: 12,
    lastDelivery: "2025-01-18",
    status: "Active",
    totalValue: "Rs. 65,200.00"
  },
  { 
    id: "4", 
    name: "Unilever Sri Lanka", 
    location: "Colombo", 
    contact: "+94 11 345 6789",
    email: "supply@unilever.lk",
    products: 22,
    lastDelivery: "2025-01-17",
    status: "Active",
    totalValue: "Rs. 98,750.00"
  },
  { 
    id: "5", 
    name: "Prima Lanka", 
    location: "Trincomalee", 
    contact: "+94 26 222 1234",
    email: "orders@prima.lk",
    products: 8,
    lastDelivery: "2025-01-15",
    status: "Inactive",
    totalValue: "Rs. 32,100.00"
  },
];

export default function Suppliers() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    return status === "Active" 
      ? <Badge className="bg-success text-success-foreground">Active</Badge>
      : <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>;
  };

  const activeSuppliers = suppliers.filter(s => s.status === "Active").length;
  const totalProducts = suppliers.reduce((sum, s) => sum + s.products, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Suppliers</h1>
          <p className="text-muted-foreground mt-1">Manage supplier relationships and contacts</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover">
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{suppliers.length}</p>
                <p className="text-sm text-muted-foreground">Total Suppliers</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">{activeSuppliers}</p>
                <p className="text-sm text-muted-foreground">Active Suppliers</p>
              </div>
              <Users className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-accent">{totalProducts}</p>
                <p className="text-sm text-muted-foreground">Supplied Products</p>
              </div>
              <Package className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">Rs. 410,550</p>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
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
              placeholder="Search suppliers by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Directory ({filteredSuppliers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier Name</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Last Delivery</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{supplier.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{supplier.location}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{supplier.contact}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{supplier.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{supplier.products} items</TableCell>
                  <TableCell>{supplier.lastDelivery}</TableCell>
                  <TableCell className="font-semibold text-accent">{supplier.totalValue}</TableCell>
                  <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive-foreground hover:bg-destructive">
                        <Trash2 className="h-4 w-4" />
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