import { useState, useEffect } from "react";
import { Plus, Scan, ShoppingCart, Trash2, Loader2 } from "lucide-react";

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Sales Components
import { CustomerInfoDialog } from "@/components/sales/CustomerInfoDialog";
import { PaymentDialog } from "@/components/sales/PaymentDialog";
import { ReceiptDialog } from "@/components/sales/ReceiptDialog";

// API
import { salesApi, Product, CreateSaleResponse } from "@/services/salesApi";

// Debug: Expose salesApi to window for console testing
if (typeof window !== 'undefined') {
  (window as any).salesApi = salesApi;
}

// Extended Product type for cart
interface CartProduct extends Product {
  quantity: number;
}

// Main Sales Component
export default function Sales() {
  // State
  const [showCustomerDialog, setShowCustomerDialog] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [customer, setCustomer] = useState<{ name: string; phone: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [barcode, setBarcode] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("1");
  
  // Order summary state
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
  });
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  
  // Loading and sale state
  const [isLoading, setIsLoading] = useState(false);
  const [saleData, setSaleData] = useState<CreateSaleResponse["sale"] | null>(null);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Calculate order summary whenever cart changes (with debouncing for API calls)
  useEffect(() => {
    if (cartItems.length > 0) {
      // Calculate locally immediately for instant feedback
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxAmount = taxPercentage > 0 ? (subtotal * taxPercentage) / 100 : 0;
      const discountAmount = discount > 0 
        ? (discountType === "percentage" ? (subtotal * discount) / 100 : discount)
        : 0;
      const total = subtotal + taxAmount - discountAmount;
      
      setOrderSummary({
        subtotal,
        tax: taxAmount,
        discount: discountAmount,
        total: Math.max(0, total),
      });
      
      // Debounce API call for large carts (only if needed in future)
      // For now, skip API call since local calculation is sufficient
    } else {
      setOrderSummary({ subtotal: 0, tax: 0, discount: 0, total: 0 });
    }
  }, [cartItems, taxPercentage, discount, discountType]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const fetchedProducts = await salesApi.findAllProducts();
      // Ensure we always set an array, even if API returns something unexpected
      setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]); // Set empty array on error
      alert("Failed to load products. Please check if the backend is running at https://my-go-backend.onrender.com");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerSubmit = (customerInfo: { name: string; phone: string }) => {
    setCustomer(customerInfo);
    setShowCustomerDialog(false);
  };

  const handleCustomerSkip = () => {
    setShowCustomerDialog(false);
  };

  const addItemByBarcode = () => {
    if (!Array.isArray(products) || products.length === 0) {
      alert("Products not loaded yet. Please wait...");
      return;
    }
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      const quantity = 1; // Default quantity for barcode scan
      addToCart(product, quantity);
      setBarcode("");
    } else {
      alert("Product not found!");
    }
  };

  const addItemBySelect = () => {
    if (!Array.isArray(products) || products.length === 0) {
      alert("Products not loaded yet. Please wait...");
      return;
    }
    const product = products.find(p => p.id === selectedProduct);
    if (product) {
      const quantity = parseInt(selectedQuantity) || 1;
      if (quantity > product.stock) {
        alert(`Only ${product.stock} items available in stock!`);
        return;
      }
      addToCart(product, quantity);
      setSelectedProduct("");
      setSelectedQuantity("1");
    }
  };

  const addToCart = (product: Product, quantityToAdd: number) => {
    console.log("Adding to cart - Product:", { 
      id: product.id, 
      productId: product.productId, 
      name: product.name 
    });
    
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantityToAdd;
      if (newQuantity > product.stock) {
        alert(`Only ${product.stock} items available in stock!`);
        return;
      }
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } else {
      const newCartItem = { ...product, quantity: quantityToAdd };
      console.log("New cart item created:", { 
        id: newCartItem.id, 
        productId: newCartItem.productId, 
        name: newCartItem.name 
      });
      setCartItems([...cartItems, newCartItem]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    const product = products.find(p => p.id === id);
    if (quantity <= 0) {
      removeItem(id);
    } else if (product && quantity > product.stock) {
      alert(`Only ${product.stock} items available in stock!`);
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handlePaymentComplete = async (method: "cash" | "card", amountReceived?: number) => {
    setIsLoading(true);
    try {
      // Validate all products still exist and have stock
      const invalidProducts: string[] = [];
      const outOfStock: string[] = [];
      
      for (const cartItem of cartItems) {
        const product = products.find(p => p.id === cartItem.id);
        if (!product) {
          invalidProducts.push(cartItem.name);
        } else if (product.stock < cartItem.quantity) {
          outOfStock.push(`${cartItem.name} (available: ${product.stock}, needed: ${cartItem.quantity})`);
        }
      }
      
      if (invalidProducts.length > 0) {
        alert(`The following products are no longer available:\n${invalidProducts.join('\n')}\n\nPlease remove them and try again.`);
        setIsLoading(false);
        return;
      }
      
      if (outOfStock.length > 0) {
        alert(`The following products are out of stock:\n${outOfStock.join('\n')}\n\nPlease adjust quantities and try again.`);
        setIsLoading(false);
        return;
      }
      
      console.log("Processing payment with:", {
        items: cartItems.map(item => ({ 
          id: item.id, 
          productId: item.productId, 
          name: item.name, 
          quantity: item.quantity 
        })),
        method,
        total: orderSummary.total
      });
      
      const result = await salesApi.createSale({
        customerName: customer?.name,
        mobileNumber: customer?.phone,
        items: cartItems.map(item => ({
          productId: item.productId, // Use productId instead of id for backend
          quantity: item.quantity,
        })),
        taxPercentage: taxPercentage > 0 ? taxPercentage : undefined,
        discount: discount > 0 ? discount : undefined,
        discountType: discount > 0 ? discountType : undefined,
        paymentMethod: method,
        amountReceived: method === "cash" ? amountReceived : undefined,
      });

      setSaleData(result.sale);
      setShowPaymentDialog(false);
      setShowReceiptDialog(true);
    } catch (error: any) {
      console.error("Failed to create sale:", error);
      const errorMessage = error?.message || "Failed to complete payment. Please try again.";
      alert(`Payment Failed:\n\n${errorMessage}\n\nPlease check the items and try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Cart is empty! Please add items to proceed.");
      return;
    }
    setShowPaymentDialog(true);
  };

  const handleNewSale = () => {
    setCartItems([]);
    setCustomer(null);
    setSaleData(null);
    setTaxPercentage(0);
    setDiscount(0);
    setDiscountType("percentage");
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
        total={orderSummary.total}
        onPaymentComplete={handlePaymentComplete}
      />

      <ReceiptDialog
        open={showReceiptDialog}
        onOpenChange={setShowReceiptDialog}
        saleData={saleData}
        onNewSale={handleNewSale}
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
                    disabled={isLoading}
                  />
                </div>
                <Button onClick={addItemByBarcode} disabled={isLoading || !barcode}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
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
                    {isLoading ? (
                      <SelectItem value="loading" disabled>Loading products...</SelectItem>
                    ) : !Array.isArray(products) || products.length === 0 ? (
                      <SelectItem value="empty" disabled>No products available</SelectItem>
                    ) : (
                      products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - Rs. {product.price.toFixed(2)} (Stock: {product.stock})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(e.target.value)}
                  placeholder="Qty"
                  className="w-20"
                />
                <Button onClick={addItemBySelect} disabled={!selectedProduct || isLoading}>
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
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
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
                </div>
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
              {/* Tax and Discount Controls */}
              <div className="space-y-3 pb-3 border-b">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tax (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Discount</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="flex-1"
                    />
                    <Select value={discountType} onValueChange={(v: "percentage" | "fixed") => setDiscountType(v)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">%</SelectItem>
                        <SelectItem value="fixed">Rs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">Rs. {orderSummary.subtotal.toFixed(2)}</span>
                </div>
                {orderSummary.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">Rs. {orderSummary.tax.toFixed(2)}</span>
                  </div>
                )}
                {orderSummary.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-red-500">- Rs. {orderSummary.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold text-primary">
                    Rs. {orderSummary.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-primary-hover"
                  disabled={cartItems.length === 0 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Checkout"
                  )}
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