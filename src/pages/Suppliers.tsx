import { useState, useEffect } from "react";
import AddSupplierDialog from "../components/AddSupplierDialog";
import ProductSelectionDialog from "../components/ProductSelectionDialog";
import { Search, Plus, Edit, Trash2, MapPin, Phone, Mail, Package, Users, ShoppingCart } from "lucide-react";
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

interface Supplier {
  supplierId: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  deleted: boolean;
  created_at: string;
  updated_at: string;
}

export default function Suppliers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://my-go-backend.onrender.com/FindAllSuppliers');
      const data = await response.json();
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProductDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setProductDialogOpen(true);
  };

  const handleCloseProductDialog = () => {
    setProductDialogOpen(false);
    setSelectedSupplier(null);
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (deleted: boolean) => {
    return !deleted 
      ? <Badge className="bg-success text-success-foreground">Active</Badge>
      : <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>;
  };

  const activeSuppliers = suppliers.filter(s => !s.deleted).length;

  return (
    <div className="space-y-6">
      {/* Add Supplier Dialog */}
      <AddSupplierDialog 
        open={addDialogOpen} 
        onClose={() => setAddDialogOpen(false)}
        onSuccess={fetchSuppliers}
      />

      {/* Product Selection Dialog */}
      {selectedSupplier && (
        <ProductSelectionDialog
          open={productDialogOpen}
          onClose={handleCloseProductDialog}
          supplierId={selectedSupplier.supplierId}
          supplierName={selectedSupplier.name}
        />
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Suppliers</h1>
          <p className="text-muted-foreground mt-1">Manage supplier relationships and contacts</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
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
                <p className="text-2xl font-bold text-destructive">{suppliers.length - activeSuppliers}</p>
                <p className="text-sm text-muted-foreground">Inactive Suppliers</p>
              </div>
              <Users className="h-8 w-8 text-destructive" />
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
              placeholder="Search suppliers by name or address..."
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading suppliers...</p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No suppliers found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier Name</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.supplierId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <span className="text-xs text-muted-foreground">{supplier.supplierId}</span>
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
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{supplier.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(supplier.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(supplier.deleted)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenProductDialog(supplier)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Products
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}