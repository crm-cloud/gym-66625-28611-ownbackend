import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon, 
  DollarSign,
  AlertCircle,
  Users,
  TrendingUp,
  FileSpreadsheet,
  File
} from 'lucide-react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { PlatformReportService } from '@/services/platformReportService';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

export const PlatformReports = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedReportType, setSelectedReportType] = useState<string>('revenue-admin');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Fetch reports based on selected type
  const { data: revenueByAdmin, isLoading: adminRevenueLoading } = useQuery({
    queryKey: ['revenue-by-admin', dateRange?.from, dateRange?.to],
    queryFn: () => PlatformReportService.getRevenueByAdmin(
      dateRange?.from?.toISOString(),
      dateRange?.to?.toISOString()
    ),
    enabled: selectedReportType === 'revenue-admin'
  });

  const { data: revenueByBranch, isLoading: branchRevenueLoading } = useQuery({
    queryKey: ['revenue-by-branch', dateRange?.from, dateRange?.to],
    queryFn: () => PlatformReportService.getRevenueByBranch(
      dateRange?.from?.toISOString(),
      dateRange?.to?.toISOString()
    ),
    enabled: selectedReportType === 'revenue-branch'
  });

  const { data: pendingInvoices, isLoading: pendingInvoicesLoading } = useQuery({
    queryKey: ['pending-invoices'],
    queryFn: () => PlatformReportService.getPendingInvoices(),
    enabled: selectedReportType === 'pending-invoices'
  });

  const { data: membershipSummary, isLoading: membershipLoading } = useQuery({
    queryKey: ['membership-summary'],
    queryFn: () => PlatformReportService.getMembershipSummary(),
    enabled: selectedReportType === 'membership-summary'
  });

  const { data: leadConversion, isLoading: leadConversionLoading } = useQuery({
    queryKey: ['lead-conversion'],
    queryFn: () => PlatformReportService.getLeadConversionReport(),
    enabled: selectedReportType === 'lead-conversion'
  });

  const isLoading = adminRevenueLoading || branchRevenueLoading || pendingInvoicesLoading || membershipLoading || leadConversionLoading;

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      let data: any;
      let reportName: string;

      switch (selectedReportType) {
        case 'revenue-admin':
          data = revenueByAdmin;
          reportName = 'Revenue by Admin';
          break;
        case 'revenue-branch':
          data = revenueByBranch;
          reportName = 'Revenue by Branch';
          break;
        case 'pending-invoices':
          data = pendingInvoices;
          reportName = 'Pending Invoices';
          break;
        case 'membership-summary':
          data = membershipSummary;
          reportName = 'Membership Summary';
          break;
        case 'lead-conversion':
          data = leadConversion;
          reportName = 'Lead Conversion';
          break;
        default:
          return;
      }

      if (!data || data.length === 0) {
        toast({
          title: "No data to export",
          description: "Please select a report with data to export.",
          variant: "destructive"
        });
        return;
      }

      switch (format) {
        case 'pdf':
          await PlatformReportService.exportToPDF(data, reportName);
          break;
        case 'excel':
          await PlatformReportService.exportToExcel(data, reportName);
          break;
        case 'csv':
          await PlatformReportService.exportToCSV(data, reportName);
          break;
      }

      toast({
        title: "Export successful",
        description: `${reportName} exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "An error occurred while exporting the report.",
        variant: "destructive"
      });
    }
  };

  const reportTypes = [
    { value: 'revenue-admin', label: 'Revenue by Admin', icon: DollarSign },
    { value: 'revenue-branch', label: 'Revenue by Branch', icon: DollarSign },
    { value: 'pending-invoices', label: 'Pending/Overdue Invoices', icon: AlertCircle },
    { value: 'membership-summary', label: 'Membership Summary', icon: Users },
    { value: 'lead-conversion', label: 'Lead Conversion', icon: TrendingUp }
  ];

  const getCurrentData = () => {
    switch (selectedReportType) {
      case 'revenue-admin':
        return revenueByAdmin;
      case 'revenue-branch':
        return revenueByBranch;
      case 'pending-invoices':
        return pendingInvoices;
      case 'membership-summary':
        return membershipSummary;
      case 'lead-conversion':
        return leadConversion;
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Reports</h1>
          <p className="text-muted-foreground">Financial reports and system analytics</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/analytics'}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedReportType} onValueChange={setSelectedReportType}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {(['revenue-admin', 'revenue-branch'].includes(selectedReportType)) && (
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-64 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport('csv')}>
                <FileText className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" onClick={() => handleExport('pdf')}>
                <File className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Revenue by Admin Report */}
            {selectedReportType === 'revenue-admin' && revenueByAdmin && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Revenue by Admin</h2>
                {revenueByAdmin.map((admin) => (
                  <Card key={admin.adminId}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{admin.adminName}</CardTitle>
                          <p className="text-sm text-muted-foreground">{admin.adminEmail}</p>
                        </div>
                        <Badge variant="outline">${admin.totalRevenue.toLocaleString()}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">GST Revenue</p>
                          <p className="text-lg font-semibold">${admin.gstRevenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Non-GST Revenue</p>
                          <p className="text-lg font-semibold">${admin.nonGstRevenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Gyms</p>
                          <p className="text-lg font-semibold">{admin.gymCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Members</p>
                          <p className="text-lg font-semibold">{admin.memberCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Revenue by Branch Report */}
            {selectedReportType === 'revenue-branch' && revenueByBranch && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Revenue by Branch</h2>
                {revenueByBranch.map((branch) => (
                  <Card key={branch.branchId}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{branch.branchName}</CardTitle>
                          <p className="text-sm text-muted-foreground">{branch.gymName} - {branch.adminName}</p>
                        </div>
                        <Badge variant="outline">${branch.totalRevenue.toLocaleString()}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">GST Revenue</p>
                          <p className="text-lg font-semibold">${branch.gstRevenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Non-GST Revenue</p>
                          <p className="text-lg font-semibold">${branch.nonGstRevenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Invoices</p>
                          <p className="text-lg font-semibold">{branch.invoiceCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Members</p>
                          <p className="text-lg font-semibold">{branch.memberCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pending Invoices Report */}
            {selectedReportType === 'pending-invoices' && pendingInvoices && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Pending & Overdue Invoices</h2>
                {pendingInvoices.map((invoice) => (
                  <Card key={invoice.invoiceId}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {invoice.invoiceNumber}
                            <Badge variant={invoice.status === 'overdue' ? 'destructive' : 'secondary'}>
                              {invoice.status}
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">${invoice.amount.toLocaleString()}</p>
                          {invoice.daysPastDue > 0 && (
                            <p className="text-sm text-red-600">{invoice.daysPastDue} days overdue</p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Branch</p>
                          <p className="font-medium">{invoice.branchName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Admin</p>
                          <p className="font-medium">{invoice.adminName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Due Date</p>
                          <p className="font-medium">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Membership Summary Report */}
            {selectedReportType === 'membership-summary' && membershipSummary && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Membership Summary</h2>
                {membershipSummary.map((branch) => (
                  <Card key={branch.branchId}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{branch.branchName}</CardTitle>
                          <p className="text-sm text-muted-foreground">{branch.gymName} - {branch.adminName}</p>
                        </div>
                        <Badge variant="outline">{branch.activeRate.toFixed(1)}% Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Active</p>
                          <p className="text-lg font-semibold text-green-600">{branch.activeMemberships}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Expired</p>
                          <p className="text-lg font-semibold text-red-600">{branch.expiredMemberships}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Frozen</p>
                          <p className="text-lg font-semibold text-yellow-600">{branch.frozenMemberships}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Members</p>
                          <p className="text-lg font-semibold">{branch.totalMembers}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Lead Conversion Report */}
            {selectedReportType === 'lead-conversion' && leadConversion && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Lead Conversion Report</h2>
                {leadConversion.map((period) => (
                  <Card key={period.period}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{period.period}</CardTitle>
                        <Badge variant="outline">{period.conversionRate.toFixed(1)}% Conversion</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Leads</p>
                          <p className="text-lg font-semibold">{period.totalLeads}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Converted</p>
                          <p className="text-lg font-semibold text-green-600">{period.convertedLeads}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Avg. Conversion Time</p>
                          <p className="text-lg font-semibold">{period.averageConversionTime.toFixed(0)} days</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Top Source</p>
                          <p className="text-lg font-semibold capitalize">{period.topSource}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {getCurrentData()?.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No data found</h3>
                  <p className="text-muted-foreground">
                    No data available for the selected report and date range.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};