import { useState, useEffect } from "react";
import { Download, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Reports() {
  const [currentDate] = useState<Date>(new Date());
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      // Get current time in GMT+5:30 (Sri Lanka time)
      const now = new Date();
      const sriLankaTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000));
      
      // Set the expiration time to midnight (00:00:00) of the next day in Sri Lanka time
      const endOfDay = new Date(sriLankaTime);
      endOfDay.setHours(24, 0, 0, 0);
      
      const diff = endOfDay.getTime() - sriLankaTime.getTime();
      
      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining({ hours, minutes, seconds });
      setIsExpired(false);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDownloadReport = () => {
    if (isExpired) {
      alert("The 24-hour download period has expired. Please try again tomorrow.");
      return;
    }

    // Format date as YYYY-MM-DD using local date values to avoid timezone issues
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    const downloadUrl = `https://my-go-backend.onrender.com/GetDailySalesSummaryPDF?date=${formattedDate}`;
    
    // Open download URL in new window
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Daily Sales Report</h1>
        <p className="text-muted-foreground mt-1">Download your daily sales summary report</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Date Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Today's Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-5xl font-bold text-primary mb-2">
                {currentDate.getDate()}
              </div>
              <div className="text-xl font-medium text-foreground">
                {currentDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {currentDate.toLocaleDateString('en-US', { 
                  weekday: 'long' 
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Countdown Timer Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Remaining
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Download available for GMT+5:30 timezone
              </p>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${isExpired ? 'text-destructive' : 'text-primary'}`}>
                    {String(timeRemaining.hours).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Hours</div>
                </div>
                <div className="text-4xl font-bold text-muted-foreground">:</div>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${isExpired ? 'text-destructive' : 'text-primary'}`}>
                    {String(timeRemaining.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Minutes</div>
                </div>
                <div className="text-4xl font-bold text-muted-foreground">:</div>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${isExpired ? 'text-destructive' : 'text-primary'}`}>
                    {String(timeRemaining.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Seconds</div>
                </div>
              </div>
              {isExpired && (
                <p className="text-sm text-destructive mt-4 font-medium">
                  Download period expired. Report unavailable.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Download Button Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Report Date: <span className="font-medium text-foreground">
                  {currentDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </p>
            </div>
            <Button 
              onClick={handleDownloadReport}
              disabled={isExpired}
              className="bg-primary hover:bg-primary-hover px-8 py-6 text-lg"
              size="lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Daily Sales Report
            </Button>
            {!isExpired && (
              <p className="text-xs text-muted-foreground">
                Note: Reports are only available for 24 hours from the end of each business day
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}