import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { mockTrainerAssignments } from '@/utils/mockData';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  CreditCard,
  Target,
  BarChart3,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface EarningsTrackerProps {
  trainerId: string;
}

export const EarningsTracker = ({ trainerId }: EarningsTrackerProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const assignments = mockTrainerAssignments.filter(a => 
    a.trainerId === trainerId && a.isPaid
  );

  // Calculate earnings data
  const earningsData = useMemo(() => {
    const now = new Date();
    const periods = [];

    if (selectedPeriod === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dayAssignments = assignments.filter(a => {
          const assignmentDate = new Date(a.scheduledDate);
          return assignmentDate.toDateString() === date.toDateString();
        });
        
        periods.push({
          period: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          earnings: dayAssignments.reduce((total, a) => total + a.amount, 0),
          sessions: dayAssignments.length,
          date: date
        });
      }
    } else if (selectedPeriod === 'weekly') {
      // Last 8 weeks
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const weekAssignments = assignments.filter(a => {
          const assignmentDate = new Date(a.scheduledDate);
          return assignmentDate >= weekStart && assignmentDate <= weekEnd;
        });
        
        periods.push({
          period: `Week ${8 - i}`,
          earnings: weekAssignments.reduce((total, a) => total + a.amount, 0),
          sessions: weekAssignments.length,
          date: weekStart
        });
      }
    } else {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const monthAssignments = assignments.filter(a => {
          const assignmentDate = new Date(a.scheduledDate);
          return assignmentDate >= monthDate && assignmentDate <= monthEnd;
        });
        
        periods.push({
          period: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          earnings: monthAssignments.reduce((total, a) => total + a.amount, 0),
          sessions: monthAssignments.length,
          date: monthDate
        });
      }
    }

    return periods;
  }, [assignments, selectedPeriod]);

  // Calculate summary stats
  const totalEarnings = assignments.reduce((total, a) => total + a.amount, 0);
  const thisMonthEarnings = assignments.filter(a => {
    const assignmentDate = new Date(a.scheduledDate);
    const now = new Date();
    return assignmentDate.getMonth() === now.getMonth() && 
           assignmentDate.getFullYear() === now.getFullYear();
  }).reduce((total, a) => total + a.amount, 0);

  const lastMonthEarnings = assignments.filter(a => {
    const assignmentDate = new Date(a.scheduledDate);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return assignmentDate.getMonth() === lastMonth.getMonth() && 
           assignmentDate.getFullYear() === lastMonth.getFullYear();
  }).reduce((total, a) => total + a.amount, 0);

  const monthlyGrowth = lastMonthEarnings > 0 ? 
    ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings * 100) : 0;

  const averageSessionValue = assignments.length > 0 ? 
    totalEarnings / assignments.length : 0;

  // Payment method distribution
  const paymentMethods = assignments.reduce((acc, a) => {
    const method = a.paymentMethod || 'unknown';
    acc[method] = (acc[method] || 0) + a.amount;
    return acc;
  }, {} as Record<string, number>);

  const paymentMethodData = Object.entries(paymentMethods).map(([method, amount]) => ({
    name: method.replace('_', ' ').toUpperCase(),
    value: amount,
    percentage: ((Number(amount) / Number(totalEarnings)) * 100).toFixed(1)
  }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const exportEarningsData = () => {
    const dataToExport = {
      summary: {
        totalEarnings,
        thisMonthEarnings,
        monthlyGrowth,
        averageSessionValue,
        totalSessions: assignments.length
      },
      periods: earningsData,
      paymentMethods: paymentMethodData,
      period: selectedPeriod,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          Earnings Tracker
        </h2>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as typeof selectedPeriod)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={exportEarningsData} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(thisMonthEarnings)}</p>
                <p className="text-sm text-muted-foreground">This Month</p>
                <div className="flex items-center gap-1 mt-1">
                  {monthlyGrowth >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-xs ${monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(monthlyGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(averageSessionValue)}</p>
                <p className="text-sm text-muted-foreground">Avg Session Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{assignments.length}</p>
                <p className="text-sm text-muted-foreground">Paid Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Earnings Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Earnings by {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value as number), 'Earnings']}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <Bar dataKey="earnings" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignments.slice(0, 10).map(assignment => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CreditCard className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {assignment.sessionType_detail.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(assignment.scheduledDate).toLocaleDateString()} • {assignment.duration}min
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Payment: {assignment.paymentMethod?.replace('_', ' ') || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(assignment.amount)}</p>
                      <Badge variant="default" className="mt-1">
                        Paid
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Trend Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Earnings Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'earnings' ? formatCurrency(value as number) : value,
                      name === 'earnings' ? 'Earnings' : 'Sessions'
                    ]}
                  />
                  <Line type="monotone" dataKey="earnings" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="sessions" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {earningsData.length > 0 ? Math.max(...earningsData.map(d => d.earnings)) : 0}
                </div>
                <div className="text-sm text-muted-foreground">Highest {selectedPeriod.slice(0, -2)} Earnings</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {earningsData.length > 0 ? Math.round(earningsData.reduce((sum, d) => sum + d.earnings, 0) / earningsData.length) : 0}
                </div>
                <div className="text-sm text-muted-foreground">Average {selectedPeriod.slice(0, -2)} Earnings</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {earningsData.length > 0 ? Math.max(...earningsData.map(d => d.sessions)) : 0}
                </div>
                <div className="text-sm text-muted-foreground">Peak Sessions</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          {/* Payment Methods Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethodData.map((method, index) => (
                  <div key={method.name} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{method.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(Number(method.value) || 0)}</div>
                      <div className="text-sm text-muted-foreground">{method.percentage}%</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">{assignments.length}</div>
                  <div className="text-sm text-muted-foreground">Total Transactions</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">{formatCurrency(averageSessionValue)}</div>
                  <div className="text-sm text-muted-foreground">Average Transaction</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-muted-foreground">Payment Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};