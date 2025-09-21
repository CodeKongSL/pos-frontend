import { useState } from "react";
import { Search, Plus, FileText, CheckCircle, XCircle, Printer } from "lucide-react";
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

const grnNotes = [
  { id: "GRN1001", supplier: "Cargills", amount: "Rs. 5,000.00", date: "2025-01-20", status: "Approved", items: 15 },
  { id: "GRN1002", supplier: "Nestle", amount: "Rs. 8,200.00", date: "2025-01-19", status: "Pending", items: 22 },
  { id: "GRN1003", supplier: "Hemas", amount: "Rs. 4,100.00", date: "2025-01-18", status: "Approved", items: 8 },
  { id: "GRN1004", supplier: "Unilever", amount: "Rs. 6,500.00", date: "2025-01-17", status: "Rejected", items: 18 },
  { id: "GRN1005", supplier: "Prima", amount: "Rs. 7,300.00", date: "2025-01-16", status: "Approved", items: 12 },
];

export default function GRN() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGRNs = grnNotes.filter(grn =>
    grn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grn.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case "Pending":
        return <Badge variant="outline" className="text-warning border-warning">Pending</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">GRN Notes</h1>
          <p className="text-muted-foreground mt-1">Manage Goods Received Notes from suppliers</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover">
          <Plus className="h-4 w-4 mr-2" />
          New GRN
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-sm text-muted-foreground">Total GRNs</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">8</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-warning">3</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <FileText className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-destructive">1</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
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
              placeholder="Search GRNs by ID or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* GRN Table */}
      <Card>
        <CardHeader>
          <CardTitle>GRN Records ({filteredGRNs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>GRN ID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGRNs.map((grn) => (
                <TableRow key={grn.id}>
                  <TableCell className="font-medium">{grn.id}</TableCell>
                  <TableCell>{grn.supplier}</TableCell>
                  <TableCell className="text-accent font-semibold">{grn.amount}</TableCell>
                  <TableCell>{grn.items} items</TableCell>
                  <TableCell>{grn.date}</TableCell>
                  <TableCell>{getStatusBadge(grn.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4" />
                      </Button>
                      {grn.status === "Pending" && (
                        <>
                          <Button size="sm" className="bg-success hover:bg-success-hover text-success-foreground">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive-foreground hover:bg-destructive">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
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