import { useQuery } from '@tanstack/react-query';
import { Calendar, TrendingUp, Users, Building2, CreditCard, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface AdvancedMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  totalGyms: number;
  activeGyms: number;
  totalBranches: number;
  totalMembers: number;
  memberGrowth: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  subscriptionDistribution: Array<{ name: string; value: number; color: string }>;
  revenueByMonth: Array<{ month: string; revenue: number; growth: number }>;
  topPerformingGyms: Array<{ name: string; revenue: number; members: number; branches: number }>;
  systemEvents: Array<{ type: 'info' | 'warning' | 'error'; count: number }>;
}

export function SuperAdminAdvancedAnalytics() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['super-admin-advanced-analytics'],
    queryFn: async (): Promise<AdvancedMetrics> => {
      // Fetch gyms data
      const { data: gyms, error: gymsError } = await supabase
        .from('gyms')
        .select('*');
      
      if (gymsError) throw gymsError;

      // Fetch branches data
      const { data: branches, error: branchesError } = await supabase
        .from('branches')
        .select('id, gym_id, current_members')
        .eq('status', 'active');
      
      if (branchesError) throw branchesError;

      // Fetch system events
      const { data: events, error: eventsError } = await supabase
        .from('system_events')
        .select('event_type')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (eventsError) throw eventsError;

      // Fetch usage data
      const { data: usage, error: usageError } = await supabase
        .from('gym_usage')
        .select('*')
        .gte('month_year', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());
      
      if (usageError) throw usageError;

      // Calculate metrics
      const activeGyms = gyms?.filter(g => g.status === 'active') || [];
      const totalMembers = branches?.reduce((sum, b) => sum + (b.current_members || 0), 0) || 0;
      
      // Calculate mock revenue
      const totalRevenue = activeGyms.length * 99; // Mock $99 per gym

      // Mock subscription distribution
      const subscriptionCounts = { 'Basic': activeGyms.length };

      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];
      const subscriptionDistribution = Object.entries(subscriptionCounts).map(([name, value], index) => ({
        name,
        value: value as number,
        color: colors[index % colors.length]
      }));

      // Mock revenue by month data
      const revenueByMonth = [
        { month: 'Jan', revenue: totalRevenue * 0.8, growth: 5 },
        { month: 'Feb', revenue: totalRevenue * 0.85, growth: 8 },
        { month: 'Mar', revenue: totalRevenue * 0.9, growth: 12 },
        { month: 'Apr', revenue: totalRevenue * 0.95, growth: 15 },
        { month: 'May', revenue: totalRevenue * 0.98, growth: 18 },
        { month: 'Jun', revenue: totalRevenue, growth: 22 },
      ];

      // Top performing gyms
      const topPerformingGyms = activeGyms
        .map(gym => ({
          name: gym.name,
          revenue: 99, // Mock revenue
          members: branches?.filter(b => b.gym_id === gym.id).reduce((sum, b) => sum + (b.current_members || 0), 0) || 0,
          branches: branches?.filter(b => b.gym_id === gym.id).length || 0
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // System events summary
      const eventCounts = events?.reduce((acc: Record<string, number>, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {}) || {};

      const systemEvents = [
        { type: 'info' as const, count: eventCounts.info || 0 },
        { type: 'warning' as const, count: eventCounts.warning || 0 },
        { type: 'error' as const, count: eventCounts.error || 0 },
      ];

      // Determine system health
      const errorCount = eventCounts.error || 0;
      const warningCount = eventCounts.warning || 0;
      const systemHealth: 'healthy' | 'warning' | 'critical' = 
        errorCount > 5 ? 'critical' : 
        warningCount > 10 ? 'warning' : 'healthy';

      return {
        totalRevenue,
        revenueGrowth: 22, // Mock growth percentage
        totalGyms: gyms?.length || 0,
        activeGyms: activeGyms.length,
        totalBranches: branches?.length || 0,
        totalMembers,
        memberGrowth: 15, // Mock growth percentage
        systemHealth,
        subscriptionDistribution,
        revenueByMonth,
        topPerformingGyms,
        systemEvents,
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +{metrics.revenueGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Gyms</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeGyms}</div>
            <p className="text-xs text-muted-foreground">
              out of {metrics.totalGyms} total gyms
            </p>
            <Progress value={(metrics.activeGyms / metrics.totalGyms) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalMembers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +{metrics.memberGrowth}% growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {metrics.systemHealth === 'healthy' && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Healthy</Badge>
                </>
              )}
              {metrics.systemHealth === 'warning' && (
                <>
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>
                </>
              )}
              {metrics.systemHealth === 'critical' && (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <Badge variant="destructive">Critical</Badge>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalBranches} branches monitored
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue and growth rate</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
            <CardDescription>Distribution of subscription plans</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.subscriptionDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {metrics.subscriptionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Gyms</CardTitle>
            <CardDescription>Ranked by revenue and member count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topPerformingGyms.map((gym, index) => (
                <div key={gym.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{gym.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {gym.branches} branches • {gym.members} members
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${gym.revenue}/mo</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Events (Last 7 Days)</CardTitle>
            <CardDescription>System activity and health indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.systemEvents}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm">Info: {metrics.systemEvents.find(e => e.type === 'info')?.count || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-sm">Warning: {metrics.systemEvents.find(e => e.type === 'warning')?.count || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-sm">Error: {metrics.systemEvents.find(e => e.type === 'error')?.count || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}