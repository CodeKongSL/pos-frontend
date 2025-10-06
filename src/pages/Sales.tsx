import { useState } from "react";
import { Plus, Banknote, CreditCard, Scan, ShoppingCart, Trash2, Printer } from "lucide-react";

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Sales Components
import { CustomerInfoDialog } from "@/components/sales/CustomerInfoDialog";
import { PaymentDialog } from "@/components/sales/PaymentDialog";
import { BarcodeScanner } from "@/components/sales/BarcodeScanner";
import { ProductSelector } from "@/components/sales/ProductSelector";
import { CartList } from "@/components/sales/CartList";
import { OrderSummary } from "@/components/sales/OrderSummary";
import { QuickStats } from "@/components/sales/QuickStats";

// Sample products data
const products = [
  { id: "1", barcode: "123456", name: "Pepsi 500ml", price: 150, stock: 20 },
  { id: "2", barcode: "123457", name: "Milo 200ml", price: 120, stock: 15 },
  { id: "3", barcode: "123458", name: "Anchor Milk Powder 400g", price: 850, stock: 8 },
  { id: "4", barcode: "123459", name: "Sunlight Soap 100g", price: 95, stock: 25 },
  { id: "5", barcode: "123460", name: "Lifebuoy Handwash 200ml", price: 280, stock: 12 },
];

// Main Sales Component
export default function Sales() {
  const [showCustomerDialog, setShowCustomerDialog] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  const handleCustomerSubmit = (customerInfo) => {
    setCustomer(customerInfo);
    setShowCustomerDialog(false);
  };

  const handleCustomerSkip = () => {
    setShowCustomerDialog(false);
  };

  const addItemByBarcode = () => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
      setBarcode("");
    }
  };

  const addItemBySelect = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (product) {
      addToCart(product);
      setSelectedProduct("");
    }
  };

  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal(); // Add tax/discount logic here if needed
  };

  const handlePaymentComplete = (method) => {
    setShowPaymentDialog(false);
    // Here you would typically save the transaction
    alert(`Payment completed via ${method}. Bill is ready to print!`);
  };

  const handlePrintBill = () => {
    window.print();
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Cart is empty!");
      return;
    }
    setShowPaymentDialog(true);
  };

  const handleNewSale = () => {
    setCartItems([]);
    setCustomer(null);
    setShowCustomerDialog(true);
  };

  return (
    <div className="space-y-6">
      <CustomerInfoDialog
        open={showCustomerDialog}
        onOpenChange={setShowCustomerDialog}
        onSubmit={handleCustomerSubmit}
        onSkip={handleCustomerSkip}
      />

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        total={calculateTotal()}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales</h1>
          <p className="text-muted-foreground mt-1">Create new sales transaction</p>
        </div>
        <Button 
          onClick={handleNewSale}
          className="bg-primary hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Sale
        </Button>
      </div>

      {/* Customer Info Display */}
      {customer && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-semibold">{customer.name}</p>
                {customer.phone && (
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomerDialog(true)}
              >
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side - Add Products */}
        <div className="lg:col-span-2 space-y-4">
          {/* Barcode Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scan Barcode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Scan className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Scan or enter barcode..."
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addItemByBarcode()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={addItemByBarcode}>
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Product Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Product</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Choose a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - Rs. {product.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addItemBySelect}>
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart Items ({cartItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No items in cart. Scan or select products to add.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>Rs. {item.price}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              +
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">Rs. {calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">Rs. 0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium">Rs. 0.00</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold text-primary">
                    Rs. {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-primary-hover"
                  disabled={cartItems.length === 0}
                >
                  Checkout
                </Button>
                <Button
                  onClick={handlePrintBill}
                  variant="outline"
                  className="w-full"
                  disabled={cartItems.length === 0}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Bill
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Items in Cart</span>
                  <Badge>{cartItems.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Quantity</span>
                  <Badge>
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}