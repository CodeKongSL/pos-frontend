import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock } from "lucide-react";

interface AlertItem {
  id: string;
  title: string;
  message: string;
  type: "warning" | "error";
  date?: string;
}

interface AlertCardProps {
  title: string;
  alerts: AlertItem[];
}

export function AlertCard({ title, alerts }: AlertCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 sm:p-6">
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No alerts at this time</p>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="flex flex-col sm:flex-row sm:items-start justify-between p-3 rounded-md bg-secondary gap-2 sm:gap-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-1 break-words">{alert.message}</p>
                {alert.date && (
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">{alert.date}</span>
                  </div>
                )}
              </div>
              <Badge 
                variant={alert.type === "error" ? "destructive" : "outline"}
                className="ml-0 sm:ml-2 self-start"
              >
                {alert.type === "error" ? "Critical" : "Warning"}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}