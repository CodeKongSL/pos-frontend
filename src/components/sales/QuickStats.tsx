import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuickStatsProps {
  itemCount: number;
  totalQuantity: number;
}

export function QuickStats({
  itemCount,
  totalQuantity,
}: QuickStatsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Items in Cart</span>
            <Badge>{itemCount}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Total Quantity</span>
            <Badge>{totalQuantity}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}