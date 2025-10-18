import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  ArrowUpRight,
  MoreHorizontal,
  Target,
  Activity,
  UserCheck,
  Star
} from 'lucide-react';
import { useBranchContext } from '@/hooks/useBranchContext';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

export const ModernAdminDashboard = () => {
  const { currentBranchId } = useBranchContext();

  // Fetch real dashboard data
  const { data: analyticsData } = useSupabaseQuery(
    ['revenue_analytics', currentBranchId],
    async () => {
      const { data, error } = await supabase
        .from('branch_analytics')
        .select('*')
        .eq('branch_id', currentBranchId)
        .order('month_year', { ascending: false })
        .limit(7);

      if (error) throw error;
      return data || [];
    },
    { enabled: !!currentBranchId }
  );

  const { data: membersData } = useSupabaseQuery(
    ['members_count', currentBranchId],
    async () => {
      const { count, error } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', currentBranchId);

      if (error) throw error;
      return count || 0;
    },
    { enabled: !!currentBranchId }
  );

  const { data: todayRevenue } = useSupabaseQuery(
    ['today_revenue', currentBranchId],
    async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('invoices')
        .select('total')
        .eq('branch_id', currentBranchId)
        .gte('created_at', today)
        .eq('status', 'paid');

      if (error) throw error;
      return data?.reduce((sum, invoice) => sum + (invoice.total || 0), 0) || 0;
    },
    { enabled: !!currentBranchId }
  );

  const { data: newMembersToday } = useSupabaseQuery(
    ['new_members_today', currentBranchId],
    async () => {
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', currentBranchId)
        .gte('created_at', today);

      if (error) throw error;
      return count || 0;
    },
    { enabled: !!currentBranchId }
  );

  const { data: attendanceToday } = useSupabaseQuery(
    ['attendance_today', currentBranchId],
    async () => {
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', currentBranchId)
        .gte('check_in_time', today);

      if (error) throw error;
      return count || 0;
    },
    { enabled: !!currentBranchId }
  );

  // Process revenue chart data
  const processedRevenueData = analyticsData?.slice(0, 7).reverse().map((item, index) => ({
    month: new Date(item.month_year).toLocaleDateString('en-US', { month: 'short' }),
    value: item.total_revenue || 0,
    percentage: Math.min((item.total_revenue || 0) / 1000 * 100, 100)
  })) || [
    { month: 'Apr', value: 32, percentage: 32 },
    { month: 'May', value: 48, percentage: 48 },
    { month: 'Jun', value: 78, percentage: 78 },
    { month: 'Jul', value: 33, percentage: 33 },
    { month: 'Aug', value: 77, percentage: 77 },
    { month: 'Sep', value: 68, percentage: 68 },
    { month: 'Oct', value: 48, percentage: 48 }
  ];

  const revenueData = processedRevenueData;

  const followUpTasks = [
    { name: 'Sarah Wilson', email: 'sarah.wilson@gmail.com', completed: true, type: 'membership' },
    { name: 'Mike Johnson', email: 'mike.johnson@gmail.com', completed: true, type: 'training' },
    { name: 'Emma Davis', phone: '(555) 123-4567', completed: false, type: 'inquiry' }
  ];

  const newMembers = [
    { id: 1, name: 'John S.', avatar: 'JS' },
    { id: 2, name: 'Anna M.', avatar: 'AM' },
    { id: 3, name: 'Mike L.', avatar: 'ML' },
    { id: 4, name: 'Lisa K.', avatar: 'LK' }
  ];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Top Schedule Bar - Gym Activities */}
      <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border/50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Scheduled today</span>
            <Badge className="bg-primary text-primary-foreground text-xs">17 Oct</Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-foreground"></div>
              </div>
              <span className="text-sm text-muted-foreground">1 hour</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-primary font-medium">10:35</span>
              <Badge variant="secondary" className="bg-primary text-primary-foreground">Schedule</Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-sm font-medium">11:00 AM</span>
            <div className="flex -space-x-2">
              {['JD', 'SM', 'AL'].map((initials, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                  {initials}
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">1 hour</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive"></div>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-foreground"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Total Revenue Card */}
        <Card className="col-span-12 lg:col-span-6 bg-card border-border/50 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Total revenue
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Keep an eye on the total income generated
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>This year</span>
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-2xl font-bold text-primary">${todayRevenue?.toFixed(2) || '0.00'}</div>
              
              {/* Revenue Chart Bar */}
              <div className="relative">
                <div className="flex items-end gap-1 h-20 mb-4">
                  {revenueData.map((item, index) => (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          index === 6 ? 'bg-primary' : 'bg-muted/50'
                        }`}
                        style={{ height: `${Math.max(item.percentage, 10)}%` }}
                      ></div>
                      <span className="text-xs text-muted-foreground">{item.month}</span>
                      <span className="text-xs text-muted-foreground">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-4xl font-bold text-foreground">Total: ${analyticsData?.reduce((sum, item) => sum + (item.total_revenue || 0), 0)?.toFixed(2) || '0.00'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side Cards */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          {/* Monthly Recurring Memberships */}
          <Card className="bg-card border-border/50 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">Monthly recurring</CardTitle>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Check your recurring monthly membership streams
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="75, 100"
                      className="text-primary"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-muted/20"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Memberships</div>
                  <div className="text-2xl font-bold text-foreground">$1,425.28</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Training Sessions Scheduled */}
          <Card className="bg-card border-border/50 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">Training sessions</CardTitle>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Track upcoming training sessions with ease
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">56</div>
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="85, 100"
                      className="text-primary"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold">85%</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Utilization</div>
                  <div className="text-sm text-foreground font-medium">Program</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Follow Up Section */}
        <Card className="col-span-12 lg:col-span-6 bg-card border-border/50 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold text-foreground">Follow up</CardTitle>
              <Badge variant="destructive" className="text-xs bg-destructive text-destructive-foreground">12</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Track ongoing communications & interactions with members
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {followUpTasks.map((task, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors border border-border/30">
                <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{task.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    {task.email ? (
                      <>
                        <Mail className="w-3 h-3" />
                        {task.email}
                      </>
                    ) : (
                      <>
                        <Phone className="w-3 h-3" />
                        {task.phone}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.completed ? (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted"></div>
                  )}
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Side Cards Row 2 */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          {/* New Members */}
          <Card className="bg-card border-border/50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-foreground">New members</CardTitle>
              <p className="text-sm text-muted-foreground">
                See how many new members have joined today
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {newMembers.map((member) => (
                    <div key={member.id} className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                      {member.avatar}
                    </div>
                  ))}
                </div>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4">
                  <span className="text-sm font-semibold">41+</span>
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sessions Completed */}
          <Card className="bg-card border-border/50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-foreground">Sessions completed</CardTitle>
              <p className="text-sm text-muted-foreground">
                Monitor attendance for all scheduled sessions
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-3xl font-bold text-foreground">New today: {newMembersToday || 0}</div>
                <div className="text-3xl font-bold text-foreground">Sessions: {attendanceToday || 0}</div>
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Completed rate</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Details */}
        <Card className="col-span-12 lg:col-span-6 bg-card border-border/50 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-foreground">Revenue details</CardTitle>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Monitor & analyze the financial performance
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Memberships</div>
                <div className="text-xl font-bold text-foreground">$1,635.88</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Training</div>
                <div className="text-xl font-bold text-foreground">$1,125.28</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  Sales tax
                  <div className="w-2 h-2 rounded-full bg-destructive"></div>
                </div>
                <div className="text-xl font-bold text-foreground">$325.36</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Member Retention */}
        <Card className="col-span-12 lg:col-span-6 bg-card border-border/50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground">Member retention</CardTitle>
            <p className="text-sm text-muted-foreground">
              Measure the consistency of member attendance over time
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-foreground">24%</div>
                <ArrowUpRight className="w-4 h-4 text-primary" />
              </div>
              <div className="relative h-16 flex items-end">
                {/* Simple line chart simulation */}
                <div className="flex items-end gap-2 w-full h-12">
                  {[30, 45, 35, 50, 40, 60, 45, 55].map((height, i) => (
                    <div key={i} className="flex-1 bg-muted/30 rounded-t-sm relative" style={{ height: `${height}%` }}>
                      {i === 7 && <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};