import { useState, useEffect } from "react";
import AddSupplierDialog from "../components/AddSupplierDialog";
import ProductSelectionDialog from "../components/ProductSelectionDialog";
import UpdateSupplierStatusDialog from "../components/UpdateSupplierStatusDialog";
import { deleteSupplierById } from "../components/supplier/services/supplier.service";
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
  status: string;
  deleted: boolean;
  created_at: string;
  updated_at: string;
}

interface StatusCounts {
  active: number;
  inactive: number;
}

export default function Suppliers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]); // Cache all suppliers
  const [suppliers, setSuppliers] = useState<Supplier[]>([]); // Filtered suppliers for display
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({ active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchAllSuppliers();
    fetchStatusCounts();
  }, []);

  // Fetch all suppliers once and cache them
  const fetchAllSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://my-go-backend.onrender.com/FindAllSuppliers');
      const data = await response.json();
      const fetchedSuppliers = data || [];
      setAllSuppliers(fetchedSuppliers); // Cache all suppliers
      setSuppliers(fetchedSuppliers); // Display all initially
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setAllSuppliers([]);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter suppliers locally from cached data
  const handleStatusFilterChange = (filter: 'all' | 'active' | 'inactive') => {
    setStatusFilter(filter);
    
    if (filter === 'all') {
      setSuppliers(allSuppliers);
    } else {
      const filtered = allSuppliers.filter(supplier => supplier.status === filter);
      setSuppliers(filtered);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      const response = await fetch('https://my-go-backend.onrender.com/GetSupplierStatusCounts');
      const data = await response.json();
      setStatusCounts(data || { active: 0, inactive: 0 });
    } catch (error) {
      console.error('Error fetching status counts:', error);
      setStatusCounts({ active: 0, inactive: 0 });
    }
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) {
      return;
    }

    try {
      setDeleting(supplierId);
      const response = await deleteSupplierById(supplierId);
      
      if (response.ok) {
        // Update cache by removing deleted supplier
        const updatedSuppliers = allSuppliers.filter(s => s.supplierId !== supplierId);
        setAllSuppliers(updatedSuppliers);
        
        // Update displayed suppliers based on current filter
        if (statusFilter === 'all') {
          setSuppliers(updatedSuppliers);
        } else {
          const filtered = updatedSuppliers.filter(s => s.status === statusFilter);
          setSuppliers(filtered);
        }
        
        // Refresh status counts
        await fetchStatusCounts();
      } else {
        console.error('Failed to delete supplier');
        alert('Failed to delete supplier. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('An error occurred while deleting the supplier.');
    } finally {
      setDeleting(null);
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

  const handleOpenStatusDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
    setSelectedSupplier(null);
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string, supplier: Supplier) => {
    if (status === 'active') {
      return (
        <Badge 
          className="bg-success text-success-foreground cursor-pointer hover:bg-success/80"
          onClick={() => handleOpenStatusDialog(supplier)}
        >
          Active
        </Badge>
      );
    } else {
      return (
        <Badge 
          variant="outline" 
          className="text-muted-foreground cursor-pointer hover:bg-muted"
          onClick={() => handleOpenStatusDialog(supplier)}
        >
          Inactive
        </Badge>
      );
    }
  };

  const totalSuppliers = statusCounts.active + statusCounts.inactive;

  return (
    <div className="space-y-6">
      {/* Add Supplier Dialog */}
      <AddSupplierDialog 
        open={addDialogOpen} 
        onClose={() => setAddDialogOpen(false)}
        onSuccess={() => {
          // Refresh cache after adding new supplier
          fetchAllSuppliers();
          fetchStatusCounts();
        }}
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

      {/* Update Supplier Status Dialog */}
      {selectedSupplier && (
        <UpdateSupplierStatusDialog
          open={statusDialogOpen}
          onClose={handleCloseStatusDialog}
          supplierId={selectedSupplier.supplierId}
          supplierName={selectedSupplier.name}
          currentStatus={selectedSupplier.status}
          onSuccess={() => {
            // Refresh cache after status update
            fetchAllSuppliers();
            fetchStatusCounts();
          }}
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
        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'all' ? 'ring-2 ring-primary' : 'hover:shadow-lg'}`}
          onClick={() => handleStatusFilterChange('all')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{totalSuppliers}</p>
                <p className="text-sm text-muted-foreground">Total Suppliers</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'active' ? 'ring-2 ring-success' : 'hover:shadow-lg'}`}
          onClick={() => handleStatusFilterChange('active')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">{statusCounts.active}</p>
                <p className="text-sm text-muted-foreground">Active Suppliers</p>
              </div>
              <Users className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${statusFilter === 'inactive' ? 'ring-2 ring-destructive' : 'hover:shadow-lg'}`}
          onClick={() => handleStatusFilterChange('inactive')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-destructive">{statusCounts.inactive}</p>
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
                    <TableCell>{getStatusBadge(supplier.status, supplier)}</TableCell>
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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                          onClick={() => handleDeleteSupplier(supplier.supplierId)}
                          disabled={deleting === supplier.supplierId}
                        >
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