export interface GRNItem {
  productId: string;
  productName?: string;
  expectedQty: number;
  receivedQty: number;
  unitCost: number;
  totalCost?: number;
  expiryDate?: string; // ISO date string
  batchNumber?: string;
  remarks?: string;
}

export interface GRN {
  grnId?: string;
  grnNumber: string;
  supplierId: string;
  supplierName?: string;
  receivedDate: string; // ISO date string
  invoiceNumber?: string;
  invoiceDate?: string; // ISO date string
  items: GRNItem[];
  totalAmount?: number;
  status: 'pending' | 'completed' | 'partial_received';
  receivedBy: string;
  notes: string;
  deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GRNCreateRequest {
  grnNumber: string;
  supplierId: string;
  supplierName: string;
  receivedDate: string; // ISO date string
  invoiceNumber?: string;
  invoiceDate?: string; // ISO date string
  items: GRNItem[];
  status: 'pending' | 'completed' | 'partial_received';
  receivedBy: string;
  notes: string;
}