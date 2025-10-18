import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, BarChart3, Filter, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AttendanceFilters } from '@/components/attendance/AttendanceFilters';
import { AttendanceSummaryCards } from '@/components/attendance/AttendanceSummaryCards';
import { AttendanceTable } from '@/components/attendance/AttendanceTable';
import { AttendanceCalendar } from '@/components/attendance/AttendanceCalendar';
import { AttendanceCharts } from '@/components/attendance/AttendanceCharts';
import { AttendanceFilter, AttendanceRecord } from '@/types/attendance';
import { 
  mockAttendanceRecords, 
  mockAttendanceSummary, 
  generateMockAttendanceRecords 
} from '@/utils/mockData';
import { toast } from '@/hooks/use-toast';

export const AttendanceDashboard = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [filters, setFilters] = useState<AttendanceFilter>({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Initialize with mock data
  useEffect(() => {
    const allRecords = [
      ...mockAttendanceRecords,
      ...generateMockAttendanceRecords(50)
    ];
    setRecords(allRecords);
    setFilteredRecords(allRecords);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...records];

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(record => 
        record.userName.toLowerCase().includes(searchLower) ||
        record.userEmail.toLowerCase().includes(searchLower) ||
        record.id.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(record => record.status === filters.status);
    }

    if (filters.userRole) {
      filtered = filtered.filter(record => record.userRole === filters.userRole);
    }

    if (filters.entryMethod) {
      filtered = filtered.filter(record => record.entryMethod === filters.entryMethod);
    }

    if (filters.branchId) {
      filtered = filtered.filter(record => record.branchId === filters.branchId);
    }

    if (filters.isLate !== undefined) {
      filtered = filtered.filter(record => record.isLate === filters.isLate);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(record => 
        new Date(record.checkInTime) >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(record => 
        new Date(record.checkInTime) <= filters.dateTo!
      );
    }

    setFilteredRecords(filtered);
  }, [records, filters]);

  const handleFiltersChange = (newFilters: AttendanceFilter) => {
    setFilters(newFilters);
  };

  const handleExport = () => {
    setIsLoading(true);
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Export Complete",
        description: `${filteredRecords.length} attendance records exported successfully.`,
      });
    }, 2000);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Data Refreshed",
        description: "Attendance data has been updated.",
      });
    }, 1000);
  };

  const handleViewDetails = (record: AttendanceRecord) => {
    // TODO: Open detailed view modal
    toast({
      title: "View Details",
      description: `Viewing details for ${record.userName}`,
    });
  };

  const handleEditRecord = (record: AttendanceRecord) => {
    // TODO: Open edit modal
    toast({
      title: "Edit Record",
      description: `Editing record for ${record.userName}`,
    });
  };

  const handleAddNote = (record: AttendanceRecord) => {
    // TODO: Open note modal
    toast({
      title: "Add Note",
      description: `Adding note to ${record.userName}'s record`,
    });
  };

  const handleManualCheckIn = () => {
    // TODO: Open manual check-in modal
    toast({
      title: "Manual Check-in",
      description: "Opening manual check-in form",
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage attendance across all branches
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleManualCheckIn}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Manual Check-in
          </Button>
          <Button
            onClick={() => setActiveTab('reports')}
            className="gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <AttendanceSummaryCards 
        summary={mockAttendanceSummary}
        isLoading={isLoading}
      />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <Users className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="w-4 h-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <Download className="w-4 h-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <AttendanceFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onExport={handleExport}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />

          {/* Attendance Table */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Attendance Records</h3>
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredRecords.length} of {records.length} records
                  </p>
                </div>
              </div>
              
              <AttendanceTable
                records={filteredRecords}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
                onEditRecord={handleEditRecord}
                onAddNote={handleAddNote}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <AttendanceCalendar
            records={filteredRecords}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onRecordClick={handleViewDetails}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <AttendanceCharts
            summary={mockAttendanceSummary}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Advanced Reporting
                </h3>
                <p className="text-muted-foreground mb-4">
                  Generate detailed attendance reports with custom parameters
                </p>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create New Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendanceDashboard;