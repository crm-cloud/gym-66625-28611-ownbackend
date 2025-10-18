import { Users, Clock, AlertCircle, CheckCircle, TrendingUp, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AttendanceSummary } from '@/types/attendance';

interface AttendanceSummaryCardsProps {
  summary: AttendanceSummary;
  isLoading?: boolean;
}

export const AttendanceSummaryCards = ({ 
  summary, 
  isLoading = false 
}: AttendanceSummaryCardsProps) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getPercentage = (count: number, total: number) => {
    return total > 0 ? ((count / total) * 100).toFixed(1) : '0';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* Total Records */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Records
          </CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{summary.totalRecords}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{summary.totalMembers} members</span>
            <span>•</span>
            <span>{summary.totalStaff} staff</span>
          </div>
        </CardContent>
      </Card>

      {/* Currently Checked In */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Currently In
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{summary.checkedInCount}</div>
          <div className="text-xs text-muted-foreground">
            {getPercentage(summary.checkedInCount, summary.totalRecords)}% of total
          </div>
        </CardContent>
      </Card>

      {/* Checked Out */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Completed Sessions
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{summary.checkedOutCount}</div>
          <div className="text-xs text-muted-foreground">
            {getPercentage(summary.checkedOutCount, summary.totalRecords)}% completion rate
          </div>
        </CardContent>
      </Card>

      {/* Late Arrivals */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Late Arrivals
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{summary.lateArrivals}</div>
          <div className="text-xs text-muted-foreground">
            {getPercentage(summary.lateArrivals, summary.totalRecords)}% of total
          </div>
        </CardContent>
      </Card>

      {/* No Shows */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            No Shows
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{summary.noShows}</div>
          <div className="text-xs text-muted-foreground">
            {getPercentage(summary.noShows, summary.totalRecords)}% of total
          </div>
        </CardContent>
      </Card>

      {/* Average Duration */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg. Duration
          </CardTitle>
          <Timer className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatDuration(summary.averageDuration)}
          </div>
          <div className="text-xs text-muted-foreground">
            Per session
          </div>
        </CardContent>
      </Card>
    </div>
  );
};