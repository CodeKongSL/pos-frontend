import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, Package2, Calendar, User, FileText } from "lucide-react";
import { GRNService } from "./grn/services/grn.service";
import { GRNCreateRequest, GRNItem } from "./grn/models/grn.model";
import { ProductService } from "./product/services/product.service";
import { Product } from "./product/models/product.model";
import { findProductsBySupplierID } from "./supplier/services/supplier.service";

interface CreateGRNDialogProps {
  children: React.ReactNode;
  onGRNCreated?: () => void;
}

interface SupplierOption {
  supplierId: string;
  name: string;
}

interface GRNFormData {
  grnNumber: string;
  supplierId: string;
  receivedDate: string;
  invoiceNumber: string;
  invoiceDate: string;
  receivedBy: string;
  notes: string;
  status: 'pending' | 'completed' | 'partial_received';
}

export function CreateGRNDialog({ children, onGRNCreated }: CreateGRNDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [supplierProducts, setSupplierProducts] = useState<any[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [formData, setFormData] = useState<GRNFormData>({
    grnNumber: "",
    supplierId: "",
    receivedDate: new Date().toISOString().split('T')[0],
    invoiceNumber: "",
    invoiceDate: "",
    receivedBy: "",
    notes: "",
    status: "pending"
  });

  const [items, setItems] = useState<GRNItem[]>([
    {
      productId: "",
      expectedQty: 1,
      receivedQty: 0,
      unitCost: 0,
      expiryDate: "",
      batchNumber: "",
      remarks: ""
    }
  ]);

  useEffect(() => {
    if (open) {
      fetchSuppliers();
      generateGRNNumber();
    }
  }, [open]);

  // Fetch supplier products when supplier changes
  useEffect(() => {
    if (formData.supplierId) {
      fetchSupplierProducts(formData.supplierId);
    } else {
      setSupplierProducts([]);
    }
  }, [formData.supplierId]);

  const generateGRNNumber = () => {
    const timestamp = Date.now();
    const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const grnNumber = `GRN${timestamp}${randomPart}`;
    setFormData(prev => ({ ...prev, grnNumber }));
  };

  const fetchSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      const response = await fetch('https://my-go-backend.onrender.com/FindAllSuppliers');
      const data = await response.json();
      if (Array.isArray(data)) {
        setSuppliers(data.filter((s: any) => !s.deleted).map((s: any) => ({
          supplierId: s.supplierId,
          name: s.name
        })));
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSuppliers([]);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await ProductService.getAllProducts({ per_page: 1000 });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchSupplierProducts = async (supplierId: string) => {
    setLoadingProducts(true);
    try {
      console.log('Fetching products for supplier:', supplierId);
      const supplierProductData = await findProductsBySupplierID(supplierId);
      setSupplierProducts(supplierProductData || []);
      console.log('Supplier products:', supplierProductData);
    } catch (error) {
      console.error('Error fetching supplier products:', error);
      setSupplierProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate form data
      if (!formData.grnNumber.trim()) {
        throw new Error('GRN number is required');
      }
      if (!formData.supplierId) {
        throw new Error('Supplier is required');
      }
      if (!formData.receivedDate) {
        throw new Error('Received date is required');
      }
      if (!formData.receivedBy.trim()) {
        throw new Error('Received by is required');
      }
      if (!formData.notes.trim()) {
        throw new Error('Notes are required');
      }

      // Validate items
      if (items.length === 0) {
        throw new Error('At least one item is required');
      }

      const validItems = items.filter(item => item.productId && item.expectedQty > 0);
      if (validItems.length === 0) {
        throw new Error('At least one valid item with product and quantity is required');
      }

      // Calculate total costs for items and add product names
      const processedItems = validItems.map(item => {
        // Find the product name from supplier products
        const supplierProduct = supplierProducts.find(sp => sp.productId === item.productId);
        const productName = supplierProduct?.productName || '';
        
        return {
          ...item,
          productName: productName,
          totalCost: item.unitCost * item.receivedQty,
          // Convert date to ISO string if provided
          expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString() : undefined
        };
      });

      // Get supplier name
      const selectedSupplier = suppliers.find(s => s.supplierId === formData.supplierId);
      const supplierName = selectedSupplier?.name || '';

      const grnData: GRNCreateRequest = {
        grnNumber: formData.grnNumber.trim(),
        supplierId: formData.supplierId,
        supplierName: supplierName,
        receivedDate: new Date(formData.receivedDate).toISOString(),
        invoiceNumber: formData.invoiceNumber.trim() || undefined,
        invoiceDate: formData.invoiceDate ? new Date(formData.invoiceDate).toISOString() : undefined,
        items: processedItems,
        status: formData.status,
        receivedBy: formData.receivedBy.trim(),
        notes: formData.notes.trim()
      };

      console.log('Creating GRN:', grnData);
      console.log('Processed items with product names:', processedItems);

      await GRNService.createGRN(grnData);

      // Show success state
      setSuccess(true);
      
      // Reset form after a short delay and close dialog
      setTimeout(() => {
        resetForm();
        setSuccess(false);
        setOpen(false);
        if (onGRNCreated) {
          onGRNCreated();
        }
      }, 1500);

    } catch (err) {
      console.error('Error creating GRN:', err);
      setError(err instanceof Error ? err.message : 'Failed to create GRN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      grnNumber: "",
      supplierId: "",
      receivedDate: new Date().toISOString().split('T')[0],
      invoiceNumber: "",
      invoiceDate: "",
      receivedBy: "",
      notes: "",
      status: "pending"
    });
    setItems([
      {
        productId: "",
        expectedQty: 1,
        receivedQty: 0,
        unitCost: 0,
        expiryDate: "",
        batchNumber: "",
        remarks: ""
      }
    ]);
    setSupplierProducts([]);
    setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    setOpen(newOpen);
  };

  const handleInputChange = (field: keyof GRNFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset items when supplier changes
    if (field === 'supplierId') {
      setItems([{
        productId: "",
        expectedQty: 1,
        receivedQty: 0,
        unitCost: 0,
        expiryDate: "",
        batchNumber: "",
        remarks: ""
      }]);
    }
    
    if (error) setError(null);
  };

  const handleItemChange = (index: number, field: keyof GRNItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        
        // If productId is being changed, log the available product information
        if (field === 'productId' && typeof value === 'string') {
          const supplierProduct = supplierProducts.find(sp => sp.productId === value);
          console.log('Selected product:', supplierProduct);
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems(prev => [...prev, {
      productId: "",
      expectedQty: 1,
      receivedQty: 0,
      unitCost: 0,
      expiryDate: "",
      batchNumber: "",
      remarks: ""
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const getProductName = (productId: string) => {
    // First try to find in supplier products
    const supplierProduct = supplierProducts.find(sp => sp.productId === productId);
    if (supplierProduct) {
      return supplierProduct.productName || 'Unknown Product';
    }
    
    // Fallback to all products (shouldn't be needed with supplier-filtered products)
    const product = products.find(p => p.productId === productId);
    return product ? product.name : 'Select Product';
  };

  const calculateTotalAmount = () => {
    return items.reduce((total, item) => total + (item.unitCost * item.receivedQty), 0).toFixed(2);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Create New GRN
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Create a new Goods Received Note for supplier deliveries
          </p>
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
              GRN Created Successfully!
            </h3>
            <p className="text-sm text-gray-500">
              GRN "{formData.grnNumber}" has been created successfully.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grnNumber">GRN Number *</Label>
                    <Input
                      id="grnNumber"
                      value={formData.grnNumber}
                      onChange={(e) => handleInputChange("grnNumber", e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier *</Label>
                    <Select
                      value={formData.supplierId}
                      onValueChange={(value) => handleInputChange("supplierId", value)}
                      disabled={isLoading || loadingSuppliers}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingSuppliers ? "Loading suppliers..." : "Select supplier"} />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.supplierId} value={supplier.supplierId}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receivedDate">Received Date *</Label>
                    <Input
                      id="receivedDate"
                      type="date"
                      value={formData.receivedDate}
                      onChange={(e) => handleInputChange("receivedDate", e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'pending' | 'completed' | 'partial_received') => handleInputChange("status", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="partial_received">Partial Received</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                      disabled={isLoading}
                      placeholder="Optional"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invoiceDate">Invoice Date</Label>
                    <Input
                      id="invoiceDate"
                      type="date"
                      value={formData.invoiceDate}
                      onChange={(e) => handleInputChange("invoiceDate", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receivedBy">Received By *</Label>
                    <Input
                      id="receivedBy"
                      value={formData.receivedBy}
                      onChange={(e) => handleInputChange("receivedBy", e.target.value)}
                      disabled={isLoading}
                      required
                      placeholder="Staff member name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes *</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    disabled={isLoading}
                    required
                    placeholder="Additional notes about this GRN..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Items Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package2 className="h-4 w-4" />
                  Items ({items.length})
                </CardTitle>
                {formData.supplierId && (
                  <p className="text-sm text-muted-foreground">
                    Only products assigned to the selected supplier are available for selection.
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          disabled={isLoading}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Product *</Label>
                        <Select
                          value={item.productId}
                          onValueChange={(value) => handleItemChange(index, "productId", value)}
                          disabled={isLoading || loadingProducts || !formData.supplierId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              !formData.supplierId 
                                ? "Select supplier first" 
                                : loadingProducts 
                                ? "Loading..." 
                                : supplierProducts.length === 0
                                ? "No products assigned to this supplier"
                                : "Select product"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {supplierProducts.length === 0 ? (
                              <div className="p-2 text-sm text-muted-foreground text-center">
                                {!formData.supplierId 
                                  ? "Select a supplier first" 
                                  : "No products assigned to this supplier"}
                              </div>
                            ) : (
                              supplierProducts.map((supplierProduct) => (
                                <SelectItem key={supplierProduct.productId} value={supplierProduct.productId}>
                                  {supplierProduct.productName} - {supplierProduct.productId}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Expected Qty *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.expectedQty}
                          onChange={(e) => handleItemChange(index, "expectedQty", parseInt(e.target.value) || 0)}
                          disabled={isLoading}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Received Qty *</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.receivedQty}
                          onChange={(e) => handleItemChange(index, "receivedQty", parseInt(e.target.value) || 0)}
                          disabled={isLoading}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Unit Cost *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitCost}
                          onChange={(e) => handleItemChange(index, "unitCost", parseFloat(e.target.value) || 0)}
                          disabled={isLoading}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => handleItemChange(index, "expiryDate", e.target.value)}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Batch Number</Label>
                        <Input
                          value={item.batchNumber}
                          onChange={(e) => handleItemChange(index, "batchNumber", e.target.value)}
                          disabled={isLoading}
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Remarks</Label>
                      <Input
                        value={item.remarks}
                        onChange={(e) => handleItemChange(index, "remarks", e.target.value)}
                        disabled={isLoading}
                        placeholder="Optional remarks for this item"
                      />
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Total Cost: Rs. {(item.unitCost * item.receivedQty).toFixed(2)}
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addItem}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>

                <div className="text-right">
                  <div className="text-lg font-semibold">
                    Total Amount: Rs. {calculateTotalAmount()}
                  </div>
                </div>
              </CardContent>
            </Card>

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
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating GRN...
                  </>
                ) : (
                  "Create GRN"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}