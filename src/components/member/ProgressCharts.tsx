
import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Activity, Weight } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { MeasurementHistory, AttendanceRecord } from '@/types/member-progress';

interface ProgressChartsProps {
  memberId: string;
  measurements: MeasurementHistory[];
  attendance: AttendanceRecord[];
}

const chartConfig = {
  weight: {
    label: "Weight",
    color: "hsl(var(--chart-1))",
  },
  bodyFat: {
    label: "Body Fat",
    color: "hsl(var(--chart-2))",
  },
  attendance: {
    label: "Attendance",
    color: "hsl(var(--chart-3))",
  },
};

export const ProgressCharts = ({ memberId, measurements, attendance }: ProgressChartsProps) => {
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('3m');

  const getTimeRangeData = () => {
    const days = timeRange === '1m' ? 30 : timeRange === '3m' ? 90 : timeRange === '6m' ? 180 : 365;
    const cutoffDate = subDays(new Date(), days);
    
    return {
      measurements: measurements.filter(m => m.date >= cutoffDate),
      attendance: attendance.filter(a => a.date >= cutoffDate)
    };
  };

  const { measurements: filteredMeasurements, attendance: filteredAttendance } = getTimeRangeData();

  // Prepare weight progress data
  const weightData = filteredMeasurements
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(m => ({
      date: format(m.date, 'MMM dd'),
      weight: m.weight,
      bodyFat: m.bodyFat || 0,
      fullDate: m.date
    }));

  // Prepare attendance data (weekly aggregation)
  const attendanceData = (() => {
    const weeklyData: Record<string, number> = {};
    
    filteredAttendance.forEach(record => {
      const weekStart = new Date(record.date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = format(weekStart, 'MMM dd');
      
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
    });

    return Object.entries(weeklyData).map(([week, count]) => ({
      week,
      visits: count
    }));
  })();

  // Calculate trends
  const weightTrend = (() => {
    if (weightData.length < 2) return null;
    const firstWeight = weightData[0].weight;
    const lastWeight = weightData[weightData.length - 1].weight;
    const change = lastWeight - firstWeight;
    const percentage = ((change / firstWeight) * 100);
    
    return {
      change: Number(change.toFixed(1)),
      percentage: Number(percentage.toFixed(1)),
      direction: change >= 0 ? 'up' : 'down'
    };
  })();

  const currentStats = (() => {
    const latest = measurements[measurements.length - 1];
    if (!latest) return null;

    return {
      weight: latest.weight,
      bodyFat: latest.bodyFat,
      bmi: latest.bmi,
      date: latest.date
    };
  })();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Weight className="h-4 w-4" />
              Current Weight
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {currentStats?.weight || '--'} kg
              </span>
              {weightTrend && (
                <Badge variant={weightTrend.direction === 'down' ? 'default' : 'secondary'}>
                  {weightTrend.direction === 'down' ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(weightTrend.change)} kg
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {currentStats ? format(currentStats.date, 'Last updated MMM dd, yyyy') : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              This Month
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {filteredAttendance.length}
              </span>
              <span className="text-sm text-muted-foreground">visits</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {filteredAttendance.length > 0 ? (
                `Last visit: ${format(filteredAttendance[filteredAttendance.length - 1]?.date || new Date(), 'MMM dd')}`
              ) : (
                'No visits recorded'
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">BMI</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {currentStats?.bmi || '--'}
              </span>
              <Badge variant="outline">
                {currentStats?.bmi ? (
                  currentStats.bmi < 25 ? 'Normal' : currentStats.bmi < 30 ? 'Overweight' : 'Obese'
                ) : (
                  'N/A'
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Body Fat: {currentStats?.bodyFat ? `${currentStats.bodyFat}%` : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Progress Charts</h3>
        <div className="flex gap-2">
          {(['1m', '3m', '6m', '1y'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '1m' ? '1 Month' : range === '3m' ? '3 Months' : range === '6m' ? '6 Months' : '1 Year'}
            </Button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <Tabs defaultValue="weight" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weight">Weight Progress</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="weight">
          <Card>
            <CardHeader>
              <CardTitle>Weight & Body Composition Trends</CardTitle>
              <CardDescription>
                Track your weight and body fat percentage over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weightData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="weight" orientation="left" />
                      <YAxis yAxisId="bodyFat" orientation="right" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        yAxisId="weight"
                        type="monotone"
                        dataKey="weight"
                        stroke="var(--color-weight)"
                        strokeWidth={2}
                        dot={{ fill: 'var(--color-weight)' }}
                      />
                      <Line
                        yAxisId="bodyFat"
                        type="monotone"
                        dataKey="bodyFat"
                        stroke="var(--color-bodyFat)"
                        strokeWidth={2}
                        dot={{ fill: 'var(--color-bodyFat)' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Weight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No measurement data available</p>
                    <p className="text-sm">Start recording measurements to see progress charts</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Attendance</CardTitle>
              <CardDescription>
                Your gym visits per week over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="visits"
                        fill="var(--color-attendance)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No attendance data available</p>
                    <p className="text-sm">Attendance will be tracked automatically with check-ins</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
