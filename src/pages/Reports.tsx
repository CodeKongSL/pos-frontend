import { useState, useEffect } from "react";
import { Download, Calendar as CalendarIcon, Clock, History, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

export default function Reports() {
  const [currentDate] = useState<Date>(new Date());
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(undefined);
  const [isRangeReportExpired, setIsRangeReportExpired] = useState(false);
  const [selectedReturnsMonth, setSelectedReturnsMonth] = useState<Date | undefined>(undefined);

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

  // Check if the selected date's month reports are expired
  useEffect(() => {
    if (!selectedStartDate) {
      setIsRangeReportExpired(false);
      return;
    }

    // Get current time in GMT+5:30 (Sri Lanka time)
    const now = new Date();
    const sriLankaTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000));
    
    // Get the first day of next month from the selected date
    const selectedMonth = selectedStartDate.getMonth();
    const selectedYear = selectedStartDate.getFullYear();
    const nextMonthStart = new Date(selectedYear, selectedMonth + 1, 1, 0, 0, 0, 0);
    
    // Check if current time is past the first day of next month
    if (sriLankaTime >= nextMonthStart) {
      setIsRangeReportExpired(true);
    } else {
      setIsRangeReportExpired(false);
    }
  }, [selectedStartDate]);

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

  const handleDownloadRangeReport = () => {
    if (!selectedStartDate) {
      alert("Please select a start date.");
      return;
    }

    if (isRangeReportExpired) {
      alert("The reports for the selected month have expired. Reports are only available until the 1st of the next month.");
      return;
    }

    // Get yesterday's date (since today isn't complete yet)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if selected date is in the future or today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateOnly = new Date(selectedStartDate);
    selectedDateOnly.setHours(0, 0, 0, 0);
    
    if (selectedDateOnly >= today) {
      alert("Please select a date from the past. Today's report is not yet complete.");
      return;
    }

    // Check if selected date is after yesterday
    yesterday.setHours(0, 0, 0, 0);
    if (selectedDateOnly > yesterday) {
      alert("Please select a date up to yesterday. Reports are only available for completed days.");
      return;
    }

    // Format date as YYYY-MM-DD
    const year = selectedStartDate.getFullYear();
    const month = String(selectedStartDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedStartDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    const downloadUrl = `https://my-go-backend.onrender.com/GetDateRangeReportsPDF?startDate=${formattedDate}`;
    
    // Open download URL in new window
    window.open(downloadUrl, '_blank');
  };

  const handleDownloadExpiringStocks = () => {
    const downloadUrl = 'https://my-go-backend.onrender.com/GetExpiringStocksReportPDF';
    
    // Open download URL in new window
    window.open(downloadUrl, '_blank');
  };

  const handleDownloadReturnsReport = () => {
    if (!selectedReturnsMonth) {
      alert("Please select a month.");
      return;
    }

    // Format month as YYYY-MM
    const year = selectedReturnsMonth.getFullYear();
    const month = String(selectedReturnsMonth.getMonth() + 1).padStart(2, '0');
    const formattedMonth = `${year}-${month}`;
    
    const downloadUrl = `https://my-go-backend.onrender.com/GetMonthlyReturnsPDF?month=${formattedMonth}`;
    
    // Open download URL in new window
    window.open(downloadUrl, '_blank');
  };

  // Get yesterday's date for display
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  };

  // Disable future dates and today in the calendar
  const disabledDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
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

      {/* Past Reports and Expiring Stocks Section - Side by Side */}
      <div className="space-y-6">
        {/* Past Reports Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Download Past Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select a start date to download sales summary from that date until yesterday
              </p>
              
              <div className="flex flex-col items-center gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedStartDate ? (
                        format(selectedStartDate, "PPP")
                      ) : (
                        <span>Pick a start date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedStartDate}
                      onSelect={setSelectedStartDate}
                      disabled={disabledDates}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {selectedStartDate && (
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Report Period: <span className="font-medium text-foreground">
                        {format(selectedStartDate, "MMM d, yyyy")} to {format(getYesterdayDate(), "MMM d, yyyy")}
                      </span>
                    </p>
                    {isRangeReportExpired && (
                      <p className="text-destructive font-medium mt-2">
                        Reports for {format(selectedStartDate, "MMMM yyyy")} have expired
                      </p>
                    )}
                  </div>
                )}

                <Button 
                  onClick={handleDownloadRangeReport}
                  disabled={!selectedStartDate || isRangeReportExpired}
                  className="bg-primary hover:bg-primary-hover mx-auto"
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Range Report
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-4 border-t">
              Note: Monthly reports are deleted on the 1st of the following month at 00:00:00
            </p>
          </CardContent>
        </Card>

        {/* Expiring Stocks Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Expiring Stock Report
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Download a report of all stocks expiring within the next 3 months
              </p>
              <Button 
                onClick={handleDownloadExpiringStocks}
                className="bg-primary hover:bg-primary-hover mx-auto"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Expiring Stocks Report
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Customer Returns Section */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Monthly Returns Report
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Select a month to download customer returns report
              </p>
              
              <div className="flex flex-col items-center gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedReturnsMonth ? (
                        format(selectedReturnsMonth, "MMMM yyyy")
                      ) : (
                        <span>Pick a month</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedReturnsMonth}
                      onSelect={setSelectedReturnsMonth}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Button 
                  onClick={handleDownloadReturnsReport}
                  disabled={!selectedReturnsMonth}
                  className="bg-primary hover:bg-primary-hover mx-auto"
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Returns Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}