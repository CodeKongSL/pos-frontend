import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReturnFormDialog } from "@/components/ReturnFormDialog";
import { CustomerReturn } from "@/types/return";
import { useState, useEffect } from "react";
import { returnService } from "@/components/returns/services/return.service";

export default function CustomerReturns() {
    const [returns, setReturns] = useState<CustomerReturn[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReturns = async () => {
        try {
            const data = await returnService.getReturns();
            setReturns(data);
        } catch (error) {
            console.error("Error fetching returns:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Customer Returns</h1>
                <ReturnFormDialog onSuccess={fetchReturns} />
            </div>

            <div className="grid gap-6">
                {/* Recent Returns */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Returns</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {returns.length === 0 ? (
                            <p className="text-muted-foreground">No returns found</p>
                        ) : (
                            <div className="space-y-4">
                                {returns.map((returnItem) => (
                                    <div
                                        key={returnItem.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium">{returnItem.customerName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Bill: {returnItem.originalBillNumber || "N/A"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-right font-medium">
                                                Rs. {returnItem.totalRefundAmount.toFixed(2)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(returnItem.returnDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <span className={`px-2 py-1 rounded-full text-sm capitalize ${
                                                returnItem.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                returnItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                returnItem.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {returnItem.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}