import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttendanceSummary } from '@/types/attendance';

interface AttendanceChartsProps {
  summary: AttendanceSummary;
  isLoading?: boolean;
}

export const AttendanceCharts = ({ 
  summary, 
  isLoading = false 
}: AttendanceChartsProps) => {
  
  // Colors for charts
  const colors = {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    success: 'hsl(var(--success))',
    warning: 'hsl(var(--warning))',
    destructive: 'hsl(var(--destructive))',
    muted: 'hsl(var(--muted-foreground))'
  };

  const pieColors = [colors.primary, colors.secondary, colors.success, colors.warning];

  // Transform data for charts with null checks
  const peakHoursData = (summary.peakHours || []).map(item => ({
    hour: `${item.hour}:00`,
    count: item.count,
    time: item.hour
  }));

  const busyDaysData = (summary.busyDays || []).map(item => ({
    day: item.day?.substring(0, 3) || 'N/A', // Mon, Tue, etc.
    count: item.count,
    fullDay: item.day
  }));

  const methodData = summary?.methodBreakdown 
    ? Object.entries(summary.methodBreakdown).map(([method, count]) => ({
        name: method.charAt(0).toUpperCase() + method.slice(1),
        value: count,
        percentage: summary.totalRecords > 0 ? ((count / summary.totalRecords) * 100).toFixed(1) : '0'
      }))
    : [];

  const branchData = (summary?.branchBreakdown || []).map(branch => ({
    name: branch?.branchName?.replace(' Branch', '') || 'Unknown',
    count: branch?.count || 0,
    fullName: branch?.branchName || 'Unknown Branch'
  }));

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading charts...</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">
              {isLoading ? 'Loading data...' : 'No data available'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Peak Hours Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Peak Hours Activity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Busiest times throughout the day
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="hour" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [value, 'Check-ins']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Bar 
                dataKey="count" 
                fill={colors.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Busy Days Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Weekly Activity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Most active days of the week
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={busyDaysData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [value, 'Total Visits']}
                labelFormatter={(label) => `Day: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke={colors.success}
                strokeWidth={3}
                dot={{ fill: colors.success, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: colors.success }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Entry Methods Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Entry Methods</CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribution of check-in methods used
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={methodData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                labelLine={false}
              >
                {methodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [value, 'Count']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Branch Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Branch Activity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Attendance distribution across branches
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={branchData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                type="number"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                type="category"
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                width={80}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [value, 'Total Visits']}
                labelFormatter={(label) => `Branch: ${label}`}
              />
              <Bar 
                dataKey="count" 
                fill={colors.secondary}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};