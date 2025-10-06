import { Scan } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BarcodeScannerProps {
  barcode: string;
  onBarcodeChange: (barcode: string) => void;
  onAdd: () => void;
}

export function BarcodeScanner({
  barcode,
  onBarcodeChange,
  onAdd,
}: BarcodeScannerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Scan Barcode</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Scan className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Scan or enter barcode..."
              value={barcode}
              onChange={(e) => onBarcodeChange(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && onAdd()}
              className="pl-10"
            />
          </div>
          <Button onClick={onAdd}>
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}