// src/components/dashboard/AlertCard.tsx
import { AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Alert {
  id: string;
  title: string;
  message: string;
  type: "warning" | "error";
  date: string;
}

interface AlertCardProps {
  title: string;
  alerts: Alert[];
}

export function AlertCard({ title, alerts }: AlertCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 sm:p-6">
        {alerts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No alerts at the moment</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-medium text-foreground">{alert.title}</p>
                <Badge
                  variant={alert.type === "error" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {alert.type === "error" ? "Critical" : "Warning"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{alert.message}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{alert.date}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}