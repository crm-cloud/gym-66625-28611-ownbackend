
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { DateRange } from 'react-day-picker';
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon, 
  Filter,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  FileSpreadsheet,
  File
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  lastGenerated: string;
  format: 'pdf' | 'excel' | 'csv';
  size: string;
  status: 'ready' | 'generating' | 'error';
}

const mockReports: Report[] = [
  {
    id: '1',
    name: 'Monthly Membership Report',
    description: 'Comprehensive membership statistics and trends',
    category: 'Membership',
    lastGenerated: '2024-01-20',
    format: 'pdf',
    size: '2.4 MB',
    status: 'ready'
  },
  {
    id: '2',
    name: 'Revenue Analysis',
    description: 'Detailed revenue breakdown by service type',
    category: 'Financial',
    lastGenerated: '2024-01-19',
    format: 'excel',
    size: '1.8 MB',
    status: 'ready'
  },
  {
    id: '3',
    name: 'Class Attendance Summary',
    description: 'Weekly class attendance and utilization rates',
    category: 'Operations',
    lastGenerated: '2024-01-18',
    format: 'csv',
    size: '856 KB',
    status: 'ready'
  },
  {
    id: '4',
    name: 'Equipment Maintenance Log',
    description: 'Equipment status and maintenance schedules',
    category: 'Equipment',
    lastGenerated: '2024-01-15',
    format: 'pdf',
    size: '3.2 MB',
    status: 'generating'
  }
];

const reportCategories = [
  { value: 'all', label: 'All Categories' },
  { value: 'Membership', label: 'Membership' },
  { value: 'Financial', label: 'Financial' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Equipment', label: 'Equipment' }
];

const quickReports = [
  {
    name: 'Today\'s Check-ins',
    description: 'Member check-in activity for today',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    name: 'Weekly Revenue',
    description: 'Revenue summary for the current week',
    icon: DollarSign,
    color: 'bg-green-500'
  },
  {
    name: 'Class Utilization',
    description: 'Current week class attendance rates',
    icon: BarChart3,
    color: 'bg-purple-500'
  },
  {
    name: 'Member Growth',
    description: 'Monthly membership growth trends',
    icon: TrendingUp,
    color: 'bg-orange-500'
  }
];

export default function ReportsPage() {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const filteredReports = mockReports.filter(report => 
    categoryFilter === 'all' || report.category === categoryFilter
  );

  const getStatusBadge = (status: Report['status']) => {
    const statusConfig = {
      ready: { variant: 'default' as const, label: 'Ready' },
      generating: { variant: 'secondary' as const, label: 'Generating...' },
      error: { variant: 'destructive' as const, label: 'Error' }
    };
    
    return statusConfig[status];
  };

  const getFormatIcon = (format: Report['format']) => {
    switch (format) {
      case 'pdf':
        return File;
      case 'excel':
        return FileSpreadsheet;
      case 'csv':
        return FileText;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generate and download business reports</p>
        </div>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Create Custom Report
        </Button>
      </div>

      {/* Quick Reports */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickReports.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.name} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`${report.color} p-2 rounded-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{report.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                      <Button variant="outline" size="sm" className="mt-3 w-full">
                        <Download className="w-3 h-3 mr-1" />
                        Generate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {reportCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Reports</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const statusBadge = getStatusBadge(report.status);
            const FormatIcon = getFormatIcon(report.format);
            
            return (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <FormatIcon className="w-8 h-8 text-muted-foreground mt-1" />
                      <div>
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {report.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant={statusBadge.variant}>
                      {statusBadge.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <Badge variant="outline">{report.category}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Generated:</span>
                    <span>{report.lastGenerated}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">File Size:</span>
                    <span>{report.size}</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      disabled={report.status === 'generating'}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      disabled={report.status === 'generating'}
                    >
                      Regenerate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No reports found</h3>
            <p className="text-muted-foreground">
              {categoryFilter !== 'all'
                ? 'Try adjusting your filters to see more reports.'
                : 'Start by creating your first custom report.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
