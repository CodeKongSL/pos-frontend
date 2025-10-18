const BASE_URL = "https://my-go-backend.onrender.com";

export interface Product {
  id: string;
  productId: string; // Original backend productId
  name: string;
  price: number;
  stock: number;
  barcode?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface OrderSummaryRequest {
  items: CartItem[];
  taxPercentage?: number;
  discount?: number;
  discountType?: "percentage" | "fixed";
}

export interface OrderSummaryResponse {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

export interface CalculateChangeRequest {
  total: number;
  amountReceived: number;
}

export interface CalculateChangeResponse {
  change: number;
}

export interface CreateSaleRequest {
  customerName?: string;
  mobileNumber?: string;
  items: CartItem[];
  taxPercentage?: number;
  discount?: number;
  discountType?: "percentage" | "fixed";
  paymentMethod: "cash" | "card";
  amountReceived?: number;
}

export interface CreateSaleResponse {
  message: string;
  sale: {
    id: string;
    date: string;
    customerName?: string;
    mobileNumber?: string;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paymentMethod: string;
    amountReceived?: number;
    change?: number;
  };
}

export const salesApi = {
  // Debug: Check if a specific product exists
  async debugCheckProduct(productId: string): Promise<void> {
    try {
      console.log(`🔍 Checking if product ${productId} exists in backend...`);
      const products = await this.findAllProducts();
      const found = products.find(p => p.productId === productId);
      
      if (found) {
        console.log(`✅ Product ${productId} FOUND:`, found);
      } else {
        console.log(`❌ Product ${productId} NOT FOUND in ${products.length} products`);
        console.log("Available product IDs:", products.map(p => p.productId).join(", "));
      }
    } catch (error) {
      console.error("Debug check failed:", error);
    }
  },

  // Fetch all products
  async findAllProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${BASE_URL}/FindAllProducts`);
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      
      // Handle response structure - could be { data: [...] } or [...]
      const rawProducts = result.data || result;
      
      // Ensure we have an array
      if (!Array.isArray(rawProducts)) {
        console.warn("API returned non-array data:", result);
        return [];
      }
      
      // Transform backend format to frontend format
      const products: Product[] = rawProducts
        .filter((p: any) => !p.deleted) // Filter out deleted products
        .map((p: any) => {
          // CRITICAL: Backend uses 'productId' field, NOT 'id'
          const productIdValue = p.productId;
          
          if (!productIdValue) {
            console.error("Product missing productId field:", p);
          }
          
          const product = {
            id: productIdValue, // Use productId for frontend display ID
            productId: productIdValue, // Keep original productId for backend reference
            name: p.name,
            price: p.sellingPrice || p.price,
            stock: p.stockQty || p.stock,
            barcode: p.barcode || undefined,
          };
          
          console.log("✓ Mapped product:", product.productId, "-", product.name);
          return product;
        });
      
      console.log(`✓ Total products loaded: ${products.length}`);
      return products;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Calculate order summary
  async calculateOrderSummary(
    request: OrderSummaryRequest
  ): Promise<OrderSummaryResponse> {
    try {
      console.log("Sending order summary request:", request);
      
      const response = await fetch(`${BASE_URL}/CalculateOrderSummary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Order summary API error:", response.status, errorText);
        throw new Error(`Failed to calculate order summary: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Order summary response:", result);
      return result;
    } catch (error) {
      console.error("Error in calculateOrderSummary:", error);
      throw error;
    }
  },

  // Calculate change for cash payment
  async calculateChange(
    request: CalculateChangeRequest
  ): Promise<CalculateChangeResponse> {
    const response = await fetch(`${BASE_URL}/CalculateChange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error("Failed to calculate change");
    }
    return response.json();
  },

  // Create a sale
  async createSale(request: CreateSaleRequest): Promise<CreateSaleResponse> {
    try {
      console.log("Creating sale with request:", request);
      console.log("Product IDs being sent:", request.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })));
      
      const response = await fetch(`${BASE_URL}/CreateSale`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("❌ Create sale API error:", response.status, errorData);
        console.error("❌ Request that failed:", JSON.stringify(request, null, 2));
        
        // Extract error message from response
        const errorMessage = errorData?.error || errorData?.message || "Failed to create sale";
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log("Sale created successfully:", result);
      return result;
    } catch (error) {
      console.error("Error in createSale:", error);
      throw error;
    }
  },
};
