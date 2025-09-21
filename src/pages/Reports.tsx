import { BarChart3, TrendingUp, FileText, Download, Calendar, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const reportTypes = [
  {
    id: "1",
    title: "Sales Report",
    description: "Daily Summary",
    type: "Sales",
    lastGenerated: "Today, 9:30 AM",
    size: "2.4 MB",
    format: "PDF"
  },
  {
    id: "2",
    title: "Profit & Loss Report",
    description: "This Month",
    type: "Financial",
    lastGenerated: "Yesterday, 6:00 PM",
    size: "1.8 MB",
    format: "Excel"
  },
  {
    id: "3",
    title: "Stock Report",
    description: "Low Stock Items",
    type: "Inventory",
    lastGenerated: "Today, 8:15 AM",
    size: "890 KB",
    format: "PDF"
  },
  {
    id: "4",
    title: "GRN Report",
    description: "Last 30 Days",
    type: "Procurement",
    lastGenerated: "2 days ago",
    size: "3.1 MB",
    format: "Excel"
  },
  {
    id: "5",
    title: "Product Performance Report",
    description: "Top 10 Sellers",
    type: "Analytics",
    lastGenerated: "Today, 7:45 AM",
    size: "1.2 MB",
    format: "PDF"
  },
];

const quickStats = [
  { label: "Today's Sales", value: "Rs. 12,450.00", change: "+12%", trend: "up" },
  { label: "Monthly Revenue", value: "Rs. 245,800.00", change: "+8%", trend: "up" },
  { label: "Profit Margin", value: "18.5%", change: "+2.1%", trend: "up" },
  { label: "Total Products", value: "156", change: "+5", trend: "up" },
];

export default function Reports() {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "Sales":
        return "bg-primary text-primary-foreground";
      case "Financial":
        return "bg-accent text-accent-foreground";
      case "Inventory":
        return "bg-warning text-warning-foreground";
      case "Procurement":
        return "bg-success text-success-foreground";
      case "Analytics":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">Generate and view business reports and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-primary hover:bg-primary-hover">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${stat.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                    {stat.change}
                  </p>
                  <TrendingUp className={`h-4 w-4 ${stat.trend === 'up' ? 'text-success' : 'text-destructive'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Report Type
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Reports</SelectItem>
                  <SelectItem value="financial">Financial Reports</SelectItem>
                  <SelectItem value="inventory">Inventory Reports</SelectItem>
                  <SelectItem value="procurement">Procurement Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Date Range
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Format
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-primary hover:bg-primary-hover">
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reportTypes.map((report) => (
              <Card key={report.id} className="border border-border hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getTypeColor(report.type)}>
                      {report.type}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Last Generated</p>
                      <p className="font-medium">{report.lastGenerated}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Size</p>
                      <p className="font-medium">{report.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{report.format}</Badge>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Report Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Schedule Reports</p>
                  <p className="text-sm text-muted-foreground">Set up automatic report generation</p>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-accent/10">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Analytics Dashboard</p>
                  <p className="text-sm text-muted-foreground">View interactive business analytics</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}