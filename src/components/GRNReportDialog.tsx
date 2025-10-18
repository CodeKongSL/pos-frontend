import React, { useState, useEffect } from "react";
import { FileText, Loader2, Download, Printer, Calendar, Package, DollarSign, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GRNService } from "@/components/grn/services/grn.service";
import type { GRNReportData } from "@/components/grn/models/grn-report.model";

interface GRNReportDialogProps {
  grnId: string | null;
  grnNumber: string;
  isOpen: boolean;
  onClose: () => void;
}

export function GRNReportDialog({ grnId, grnNumber, isOpen, onClose }: GRNReportDialogProps) {
  const [reportData, setReportData] = useState<GRNReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && grnId) {
      fetchGRNReport();
    }
  }, [isOpen, grnId]);

  const fetchGRNReport = async () => {
    if (!grnId) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await GRNService.getGRNReport(grnId);
      setReportData(response.data);
    } catch (err) {
      console.error('Error fetching GRN report:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch GRN report');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "partial_received":
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getQuantityStatusBadge = (status: string, discrepancy: number) => {
    switch (status) {
      case "excess":
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Excess (+{Math.abs(discrepancy)})</Badge>;
      case "shortage":
        return <Badge variant="outline" className="text-red-600 border-red-600">Shortage (-{Math.abs(discrepancy)})</Badge>;
      case "exact":
        return <Badge className="bg-green-600 text-white">Exact Match</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // This could be enhanced to generate a PDF
    console.log('Download functionality would be implemented here');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            GRN Report - {grnNumber}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="print:hidden">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12 print:hidden">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading GRN report...</span>
          </div>
        ) : reportData ? (
          <div className="space-y-6 print:space-y-4">
            {/* Report Header */}
            <div className="border-b pb-4 print:border-b-2 print:border-black">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold print:text-3xl">{reportData.reportMetadata.reportTitle}</h2>
                  <p className="text-muted-foreground print:text-black">{reportData.reportMetadata.reportSubtitle}</p>
                  <p className="text-sm text-muted-foreground mt-1 print:text-black">
                    Generated on: {reportData.reportMetadata.generatedAt}
                  </p>
                </div>
                <div className="flex gap-2 print:hidden">
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </div>

            {/* GRN Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    GRN Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GRN ID:</span>
                    <span className="font-medium">{reportData.grnHeader.grnId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GRN Number:</span>
                    <span className="font-medium">{reportData.grnHeader.grnNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice Number:</span>
                    <span className="font-medium">{reportData.grnHeader.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(reportData.grnHeader.status.value)}
                      <Badge 
                        style={{ 
                          backgroundColor: reportData.grnHeader.status.color,
                          color: 'white'
                        }}
                      >
                        {reportData.grnHeader.status.displayName}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Received By:</span>
                    <span className="font-medium">{reportData.grnHeader.receivedBy}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Supplier & Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Supplier:</span>
                    <span className="font-medium">{reportData.grnHeader.supplierInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Supplier ID:</span>
                    <span className="font-medium">{reportData.grnHeader.supplierInfo.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice Date:</span>
                    <span className="font-medium">{reportData.grnHeader.dates.invoiceFormatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Received Date:</span>
                    <span className="font-medium">{reportData.grnHeader.dates.receivedFormatted}</span>
                  </div>
                  {reportData.grnHeader.notes && (
                    <div className="pt-2 border-t">
                      <span className="text-muted-foreground">Notes:</span>
                      <p className="text-sm mt-1">{reportData.grnHeader.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {reportData.summary.quantities.totalItems}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Items</p>
                      <p className="text-xs text-muted-foreground">
                        Expected: {reportData.summary.quantities.totalExpectedQty} | 
                        Received: {reportData.summary.quantities.totalReceivedQty}
                      </p>
                    </div>
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-accent">
                        {reportData.summary.financials.formattedTotalAmount}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-xs text-muted-foreground">
                        Currency: {reportData.summary.financials.currency}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {reportData.summary.completion.completionRate}%
                      </p>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                      <p className="text-xs text-muted-foreground">
                        Discrepancies: {reportData.summary.quantities.itemsWithDiscrepancy}
                      </p>
                    </div>
                    {reportData.summary.completion.isComplete ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-8 w-8 text-yellow-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Items Detail Table */}
            <Card>
              <CardHeader>
                <CardTitle>Items Detail</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Expected</TableHead>
                      <TableHead className="text-center">Received</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                      <TableHead>Additional Info</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.itemsDetail.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">{item.productId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {item.quantities.expected}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {item.quantities.received}
                        </TableCell>
                        <TableCell className="text-center">
                          {getQuantityStatusBadge(item.quantities.status, item.quantities.discrepancy)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.costs.formattedUnitCost}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.costs.formattedTotalCost}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {item.additionalInfo.batchNumber && (
                              <p><span className="text-muted-foreground">Batch:</span> {item.additionalInfo.batchNumber}</p>
                            )}
                            {item.additionalInfo.expiryFormatted && (
                              <p><span className="text-muted-foreground">Expires:</span> {item.additionalInfo.expiryFormatted}</p>
                            )}
                            {item.additionalInfo.remarks && (
                              <p><span className="text-muted-foreground">Remarks:</span> {item.additionalInfo.remarks}</p>
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
        ) : null}
      </DialogContent>
    </Dialog>
  );
}