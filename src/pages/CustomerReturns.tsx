import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReturnFormDialog } from "@/components/ReturnFormDialog";
import { useState, useEffect } from "react";
import { Package, Phone, FileText, Calendar, AlertCircle } from "lucide-react";

export default function CustomerReturns() {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReturns = async () => {
        try {
            const response = await fetch("https://my-go-backend.onrender.com/returns");
            if (!response.ok) throw new Error("Failed to fetch returns");
            const data = await response.json();
            setReturns(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching returns:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getReasonBadgeColor = (reason) => {
        const colors = {
            'Damaged': 'bg-red-100 text-red-800 border-red-200',
            'Defective': 'bg-orange-100 text-orange-800 border-orange-200',
            'Unwanted': 'bg-blue-100 text-blue-800 border-blue-200',
            'Wrong Item': 'bg-purple-100 text-purple-800 border-purple-200',
        };
        return colors[reason] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customer Returns</h1>
                    <p className="text-muted-foreground mt-1">Manage and track product returns</p>
                </div>
                <ReturnFormDialog onSuccess={fetchReturns} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Recent Returns
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Loading returns...</p>
                            </div>
                        </div>
                    ) : returns.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <p className="text-muted-foreground font-medium">No returns found</p>
                            <p className="text-sm text-muted-foreground mt-1">Returns will appear here once created</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Customer</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Contact</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Bill Number</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Products Returned</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {returns.map((returnItem) => (
                                        <tr key={returnItem.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="font-medium">{returnItem.customerName}</p>
                                                    {returnItem.additionalNotes && (
                                                        <div className="flex items-start gap-1 mt-1">
                                                            <AlertCircle className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                            <p className="text-xs text-muted-foreground line-clamp-2">{returnItem.additionalNotes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{returnItem.contactNumber || "N/A"}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-mono">{returnItem.originalBillNumber || "N/A"}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="space-y-2">
                                                    {Array.isArray(returnItem.products) && returnItem.products.length > 0 ? (
                                                        returnItem.products.map((product, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-sm font-medium">{product.amount}x</span>
                                                                <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{product.productId}</span>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full border ${getReasonBadgeColor(product.reason)}`}>
                                                                    {product.reason}
                                                                </span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">No products</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm whitespace-nowrap">{formatDate(returnItem.createdAt)}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}