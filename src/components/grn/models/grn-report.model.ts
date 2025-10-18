export interface GRNReportResponse {
  success: boolean;
  data: GRNReportData;
}

export interface GRNReportData {
  grnHeader: GRNHeader;
  itemsDetail: GRNItemDetail[];
  printOptions: PrintOptions;
  reportMetadata: ReportMetadata;
  summary: GRNSummary;
}

export interface GRNHeader {
  dates: {
    invoice: string;
    invoiceFormatted: string;
    received: string;
    receivedFormatted: string;
  };
  grnId: string;
  grnNumber: string;
  invoiceNumber: string;
  notes: string;
  receivedBy: string;
  status: {
    badge: string;
    color: string;
    displayName: string;
    value: string;
  };
  supplierInfo: {
    id: string;
    name: string;
  };
}

export interface GRNItemDetail {
  additionalInfo: {
    batchNumber: string;
    expiryDate: string;
    expiryFormatted: string;
    remarks: string;
  };
  costs: {
    formattedTotalCost: string;
    formattedUnitCost: string;
    totalCost: number;
    unitCost: number;
  };
  productId: string;
  productName: string;
  quantities: {
    discrepancy: number;
    expected: number;
    received: number;
    status: string;
  };
}

export interface PrintOptions {
  includeFooter: boolean;
  includeHeader: boolean;
  includeSignature: boolean;
  orientation: string;
  paperSize: string;
}

export interface ReportMetadata {
  generatedAt: string;
  reportSubtitle: string;
  reportTitle: string;
}

export interface GRNSummary {
  completion: {
    completionRate: number;
    isComplete: boolean;
    isPartial: boolean;
    isPending: boolean;
  };
  financials: {
    currency: string;
    formattedTotalAmount: string;
    totalAmount: number;
  };
  quantities: {
    discrepancyPercentage: number;
    itemsWithDiscrepancy: number;
    totalExpectedQty: number;
    totalItems: number;
    totalReceivedQty: number;
  };
}