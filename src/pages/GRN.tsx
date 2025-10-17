import React, { useState, useEffect } from "react";
import { Search, Plus, FileText, CheckCircle, XCircle, Printer, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
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
import { CreateGRNDialog } from "@/components/CreateGRNDialog";
import { GRNService } from "@/components/grn/services/grn.service";
import type { GRN, GRNPaginationResponse } from "@/components/grn/models/grn.model";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function GRN() {
  const [searchTerm, setSearchTerm] = useState("");
  const [grns, setGrns] = useState<GRN[]>([]);
  const [grnPagination, setGrnPagination] = useState<GRNPaginationResponse | null>(null);
  const [totalGRNsCount, setTotalGRNsCount] = useState<number>(0);
  const [completedGRNsCount, setCompletedGRNsCount] = useState<number>(0);
  const [pendingGRNsCount, setPendingGRNsCount] = useState<number>(0);
  const [partialReceivedGRNsCount, setPartialReceivedGRNsCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Fetch GRNs on component mount
  useEffect(() => {
    fetchGRNs();
  }, []);

  // Fetch GRNs when pagination changes
  useEffect(() => {
    fetchGRNs();
  }, [currentPage, itemsPerPage]);

  const fetchGRNs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch GRNs and all counts in parallel
      const [grnData, totalCount, completedCount, pendingCount, partialReceivedCount] = await Promise.all([
        GRNService.getAllGRNs({ 
          page: currentPage, 
          per_page: itemsPerPage 
        }),
        GRNService.getTotalGRNsCount(),
        GRNService.getCompletedGRNsCount(),
        GRNService.getPendingGRNsCount(),
        GRNService.getPartialReceivedGRNsCount()
      ]);
      
      console.log('Fetched GRNs data:', {
        grnsCount: grnData.data.length,
        pagination: {
          page: grnData.page,
          per_page: grnData.per_page,
          total: grnData.total,
          total_pages: grnData.total_pages
        },
        actualTotalCount: totalCount,
        actualCompletedCount: completedCount,
        actualPendingCount: pendingCount,
        actualPartialReceivedCount: partialReceivedCount
      });
      
      setGrnPagination(grnData);
      setGrns(grnData.data);
      setTotalGRNsCount(totalCount);
      setCompletedGRNsCount(completedCount);
      setPendingGRNsCount(pendingCount);
      setPartialReceivedGRNsCount(partialReceivedCount);
    } catch (err) {
      console.error('Error fetching GRNs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch GRNs');
    } finally {
      setLoading(false);
    }
  };

  const filteredGRNs = grns.filter(grn =>
    grn.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grn.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grn.grnId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // All stats now come from dedicated backend APIs

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-warning border-warning">Pending</Badge>;
      case "partial_received":
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Partial Received</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleGRNCreated = () => {
    console.log('GRN created, refreshing list and counts...');
    fetchGRNs(); // Refresh the list and all counts when a new GRN is created
  };

  const handleStatusUpdate = async (grnId: string, newStatus: 'completed' | 'partial_received') => {
    if (!grnId) {
      console.error('GRN ID is required for status update');
      return;
    }

    try {
      setUpdatingStatus(grnId);
      setError(null);
      
      console.log('Updating GRN status:', { grnId, newStatus });
      
      await GRNService.updateGRNStatus(grnId, newStatus);
      
      // Refresh the GRN list to show updated status
      await fetchGRNs();
      
      console.log('GRN status updated successfully');
    } catch (err) {
      console.error('Error updating GRN status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update GRN status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">GRN Notes</h1>
          <p className="text-muted-foreground mt-1">Manage Goods Received Notes from suppliers</p>
        </div>
        <CreateGRNDialog onGRNCreated={handleGRNCreated}>
          <Button className="bg-primary hover:bg-primary-hover">
            <Plus className="h-4 w-4 mr-2" />
            New GRN
          </Button>
        </CreateGRNDialog>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{loading ? "-" : totalGRNsCount}</p>
                <p className="text-sm text-muted-foreground">Total GRNs</p>
                <p className="text-xs text-muted-foreground">Showing {grns.length} of {totalGRNsCount}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">{loading ? "-" : completedGRNsCount}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-warning">{loading ? "-" : pendingGRNsCount}</p>
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
                <p className="text-2xl font-bold text-blue-600">{loading ? "-" : partialReceivedGRNsCount}</p>
                <p className="text-sm text-muted-foreground">Partial Received</p>
              </div>
              <XCircle className="h-8 w-8 text-blue-600" />
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading GRNs...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>GRN Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGRNs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No GRNs found matching your search.' : 'No GRNs available.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGRNs.map((grn) => (
                    <TableRow key={grn.grnId || grn.grnNumber}>
                      <TableCell className="font-medium">{grn.grnNumber}</TableCell>
                      <TableCell>{grn.supplierName || 'Unknown Supplier'}</TableCell>
                      <TableCell className="text-accent font-semibold">
                        {grn.totalAmount ? formatCurrency(grn.totalAmount) : 'N/A'}
                      </TableCell>
                      <TableCell>{grn.items.length} items</TableCell>
                      <TableCell>{formatDate(grn.receivedDate)}</TableCell>
                      <TableCell>{getStatusBadge(grn.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Printer className="h-4 w-4" />
                          </Button>
                          {grn.status === "pending" && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-success hover:bg-success-hover text-success-foreground"
                                onClick={() => handleStatusUpdate(grn.grnId!, 'completed')}
                                disabled={updatingStatus === grn.grnId}
                              >
                                {updatingStatus === grn.grnId ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </Button>
                              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive-foreground hover:bg-destructive">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {grnPagination && grnPagination.total_pages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Items per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="border border-input rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none bg-background"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, grnPagination.total)} of {grnPagination.total} GRNs
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: grnPagination.total_pages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 || 
                             page === grnPagination.total_pages || 
                             Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, visiblePages) => {
                      const showEllipsisBefore = index > 0 && page > visiblePages[index - 1] + 1;
                      
                      return (
                        <React.Fragment key={page}>
                          {showEllipsisBefore && (
                            <span className="px-3 py-2 text-sm text-muted-foreground">...</span>
                          )}
                          <Button
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="px-3 py-2 text-sm"
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === grnPagination.total_pages}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}