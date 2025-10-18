
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, Calendar, Users, Download, Eye } from 'lucide-react';
import { PermissionGate } from '@/components/PermissionGate';

export default function TrainerEarningsPage() {
  const earningsOverview = {
    thisMonth: 2840,
    lastMonth: 2650,
    thisYear: 32400,
    totalSessions: 156,
    hourlyRate: 65,
    avgSessionsPerWeek: 18
  };

  const monthlyBreakdown = [
    { month: 'January', sessions: 24, earnings: 1560, hours: 24 },
    { month: 'February', sessions: 28, earnings: 1820, hours: 28 },
    { month: 'March', sessions: 32, earnings: 2080, hours: 32 },
    { month: 'April', sessions: 30, earnings: 1950, hours: 30 },
    { month: 'May', sessions: 35, earnings: 2275, hours: 35 },
    { month: 'June', sessions: 38, earnings: 2470, hours: 38 }
  ];

  const recentPayments = [
    { date: '2024-01-15', client: 'Sarah Johnson', sessions: 4, amount: 260, status: 'paid' },
    { date: '2024-01-14', client: 'Mike Chen', sessions: 3, amount: 195, status: 'paid' },
    { date: '2024-01-13', client: 'Lisa Rodriguez', sessions: 4, amount: 260, status: 'paid' },
    { date: '2024-01-12', client: 'David Kim', sessions: 2, amount: 130, status: 'pending' },
    { date: '2024-01-11', client: 'Emma Davis', sessions: 3, amount: 195, status: 'paid' }
  ];

  const sessionTypes = [
    { type: 'Personal Training', sessions: 120, rate: 65, earnings: 7800 },
    { type: 'Group Sessions', sessions: 24, rate: 35, earnings: 840 },
    { type: 'Specialized Training', sessions: 12, rate: 85, earnings: 1020 }
  ];

  const growthPercentage = ((earningsOverview.thisMonth - earningsOverview.lastMonth) / earningsOverview.lastMonth * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Earnings</h1>
          <p className="text-muted-foreground">
            Track your training income and session statistics
          </p>
        </div>
        <PermissionGate permission="trainer.earnings.view">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </PermissionGate>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">${earningsOverview.thisMonth.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">This Month</p>
                <Badge variant={parseFloat(growthPercentage) > 0 ? 'default' : 'secondary'} className="text-xs mt-1">
                  {parseFloat(growthPercentage) > 0 ? '+' : ''}{growthPercentage}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{earningsOverview.totalSessions}</p>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-xs text-muted-foreground">This year</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">${earningsOverview.hourlyRate}</p>
                <p className="text-sm text-muted-foreground">Hourly Rate</p>
                <p className="text-xs text-muted-foreground">Average</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{earningsOverview.avgSessionsPerWeek}</p>
                <p className="text-sm text-muted-foreground">Sessions/Week</p>
                <p className="text-xs text-muted-foreground">Average</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Recent Payments</TabsTrigger>
          <TabsTrigger value="breakdown">Session Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Earnings Trend</CardTitle>
                <CardDescription>Your earnings progression over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthlyBreakdown.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{month.month}</p>
                        <p className="text-sm text-muted-foreground">{month.sessions} sessions • {month.hours}h</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${month.earnings.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">${(month.earnings / month.sessions).toFixed(0)}/session</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Yearly Summary</CardTitle>
                <CardDescription>Your performance this year</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Total Earnings</span>
                    <span className="text-xl font-bold">${earningsOverview.thisYear.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Total Sessions</span>
                    <span className="text-xl font-bold">{earningsOverview.totalSessions}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Average per Session</span>
                    <span className="text-xl font-bold">${(earningsOverview.thisYear / earningsOverview.totalSessions).toFixed(0)}</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h4 className="font-medium mb-2">Goals Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Annual Target: $40,000</span>
                      <span>{((earningsOverview.thisYear / 40000) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(earningsOverview.thisYear / 40000) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Latest session payments and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPayments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{payment.client}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.sessions} sessions • {new Date(payment.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold">${payment.amount}</p>
                        <p className="text-sm text-muted-foreground">${(payment.amount / payment.sessions).toFixed(0)}/session</p>
                      </div>
                      <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>
                        {payment.status}
                      </Badge>
                      <PermissionGate permission="trainer.earnings.view">
                        <Button size="sm" variant="ghost">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </PermissionGate>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Type Breakdown</CardTitle>
              <CardDescription>Earnings breakdown by session type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessionTypes.map((type, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{type.type}</h4>
                      <Badge variant="outline">${type.rate}/session</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Sessions</p>
                        <p className="font-bold">{type.sessions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rate</p>
                        <p className="font-bold">${type.rate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Earnings</p>
                        <p className="font-bold">${type.earnings.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
