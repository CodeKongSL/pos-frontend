import { DollarSign, ShoppingCart, RotateCcw, TrendingUp, Package, AlertTriangle } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const lowStockAlerts = [
    {
      id: "1",
      title: "Pepsi 500ml",
      message: "Only 2 items left in stock",
      type: "warning" as const,
      date: "Today, 2:30 PM"
    }
  ];

  const expiredAlerts = [
    {
      id: "1",
      title: "Yoghurt Cup 100g",
      message: "Expired on 2025-08-15",
      type: "error" as const,
      date: "2 days ago"
    }
  ];

  const popularProducts = [
    { name: "Pepsi 500ml", sold: 45, revenue: "Rs. 8,100.00" },
    { name: "Milo 200ml", sold: 32, revenue: "Rs. 4,800.00" },
    { name: "Anchor Milk Powder", sold: 28, revenue: "Rs. 26,600.00" },
    { name: "Sunlight Soap", sold: 25, revenue: "Rs. 3,000.00" },
    { name: "Dettol Handwash", sold: 18, revenue: "Rs. 6,120.00" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Today's overview • {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          Live Data
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Today Sales"
          value="Rs. 12,450.00"
          icon={DollarSign}
          trend="+12% from yesterday"
          trendUp={true}
        />
        <MetricCard
          title="Today GRNs"
          value="Rs. 8,000.00"
          icon={ShoppingCart}
          trend="5 deliveries received"
          trendUp={true}
        />
        <MetricCard
          title="Today Returns"
          value="Rs. 1,250.00"
          icon={RotateCcw}
          trend="3 return transactions"
        />
        <MetricCard
          title="Today Profit"
          value="Rs. 3,200.00"
          icon={TrendingUp}
          trend="+8% from yesterday"
          trendUp={true}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Low Stock Alerts */}
        <AlertCard
          title="Low Stock Alerts"
          alerts={lowStockAlerts}
        />

        {/* Expired Items */}
        <AlertCard
          title="Expired Items"
          alerts={expiredAlerts}
        />

        {/* Popular Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-accent" />
              Popular Products Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {popularProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-3 rounded-md bg-secondary">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sold} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-accent">{product.revenue}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <p className="text-2xl font-bold text-primary">156</p>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-warning">12</p>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-success">89%</p>
              <p className="text-sm text-muted-foreground">Stock Health</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-accent">25</p>
              <p className="text-sm text-muted-foreground">Active Suppliers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}