import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useAttendance } from '@/hooks/useAttendance';

export default function TrainerAttendancePage() {
  const { authState } = useAuth();

  const { data: attendanceRecords, isLoading } = useAttendance({
    userId: authState.user?.id,
    startDate: startOfMonth(new Date()).toISOString(),
    endDate: endOfMonth(new Date()).toISOString()
  });

  const stats = {
    totalDays: attendanceRecords?.filter(r => r.status === 'checked-out').length || 0,
    totalHours: Math.round((attendanceRecords?.reduce((sum, r) => sum + (r.duration || 0), 0) || 0) / 60),
    avgHoursPerDay: attendanceRecords?.length 
      ? Math.round((attendanceRecords.reduce((sum, r) => sum + (r.duration || 0), 0) / attendanceRecords.length) / 60 * 10) / 10
      : 0
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Attendance</h1>
        <p className="text-muted-foreground">
          Track your check-ins and work hours
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalDays}</p>
                <p className="text-sm text-muted-foreground">Days This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalHours}h</p>
                <p className="text-sm text-muted-foreground">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgHoursPerDay}h</p>
                <p className="text-sm text-muted-foreground">Avg Per Day</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Your check-in records for this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendanceRecords && attendanceRecords.length > 0 ? (
              attendanceRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {format(new Date(record.check_in_time), 'MMM dd, yyyy')}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(record.check_in_time), 'h:mm a')} - 
                        {record.check_out_time ? format(new Date(record.check_out_time), ' h:mm a') : ' Present'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {record.duration ? `${Math.round(record.duration / 60)}h ${record.duration % 60}m` : '-'}
                    </span>
                    <Badge variant={record.status === 'checked-out' ? 'default' : 'secondary'}>
                      {record.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No attendance records found for this month
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
