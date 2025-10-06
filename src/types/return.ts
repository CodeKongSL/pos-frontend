import { Product } from "./product";

export interface ReturnItem {
    product: Product;
    quantity: number;
    reason: string;
    condition: 'damaged' | 'defective' | 'unwanted' | 'wrong-item';
}

export interface CustomerReturn {
    id: string;
    customerName: string;
    contactNumber?: string;
    originalBillNumber?: string;
    returnDate: Date;
    items: ReturnItem[];
    totalRefundAmount: number;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    notes?: string;
}