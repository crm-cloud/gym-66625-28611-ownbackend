import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrainerSchedule } from './TrainerSchedule';
import { ClientManagement } from './ClientManagement';
import { EarningsTracker } from './EarningsTracker';
import { useToast } from '@/hooks/use-toast';
import { mockTrainers, mockTrainerAssignments } from '@/utils/mockData';
import { 
  Calendar,
  Users,
  DollarSign,
  Clock,
  Star,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Bell,
  Settings,
  BarChart3
} from 'lucide-react';

interface TrainerDashboardProps {
  trainerId?: string;
  className?: string;
}

export const TrainerDashboard = ({ trainerId = 'trainer_001', className = "" }: TrainerDashboardProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  const trainer = mockTrainers.find(t => t.id === trainerId);
  const trainerAssignments = mockTrainerAssignments.filter(a => a.trainerId === trainerId);
  
  // Mock pending assignment requests
  useEffect(() => {
    const mockRequests = [
      {
        id: 'req_001',
        memberId: 'member_001',
        memberName: 'Sarah Johnson',
        memberAvatar: '/placeholder-avatar.jpg',
        sessionType: 'strength_training',
        requestedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        duration: 60,
        notes: 'Looking to focus on compound movements and strength building',
        urgency: 'medium',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'req_002',
        memberId: 'member_002',
        memberName: 'Mike Wilson',
        memberAvatar: '/placeholder-avatar.jpg',
        sessionType: 'cardio',
        requestedDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        duration: 45,
        notes: 'Marathon training preparation',
        urgency: 'high',
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      }
    ];
    setPendingRequests(mockRequests);
  }, []);

  if (!trainer) {
    return <div className="text-center p-8">Trainer not found</div>;
  }

  const todaysSessions = trainerAssignments.filter(a => {
    const today = new Date();
    const sessionDate = new Date(a.scheduledDate);
    return sessionDate.toDateString() === today.toDateString();
  });

  const weeksSessions = trainerAssignments.filter(a => {
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    return new Date(a.scheduledDate) <= oneWeekFromNow && new Date(a.scheduledDate) >= new Date();
  });

  const monthlyRevenue = trainerAssignments
    .filter(a => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return new Date(a.scheduledDate) >= oneMonthAgo && a.isPaid;
    })
    .reduce((total, a) => total + a.amount, 0);

  const handleAcceptRequest = async (requestId: string) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setPendingRequests(prev => prev.filter(req => req.id !== requestId));
    toast({
      title: "Request Accepted",
      description: "The session request has been accepted and added to your schedule.",
    });
  };

  const handleRejectRequest = async (requestId: string) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setPendingRequests(prev => prev.filter(req => req.id !== requestId));
    toast({
      title: "Request Rejected",
      description: "The session request has been declined.",
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatSpecialty = (specialty: string) => {
    return specialty.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={trainer.avatar} alt={trainer.fullName} />
            <AvatarFallback className="text-xl">{getInitials(trainer.fullName)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {trainer.fullName.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">
              {formatSpecialty(trainer.specialties[0])} • {trainer.experience} years experience
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button variant="outline" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {pendingRequests.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todaysSessions.length}</p>
                <p className="text-sm text-muted-foreground">Sessions Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{trainer.totalClients}</p>
                <p className="text-sm text-muted-foreground">Active Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{trainer.rating}</p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests Alert */}
      {pendingRequests.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              Pending Session Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.map(request => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-white border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={request.memberAvatar} alt={request.memberName} />
                    <AvatarFallback>{getInitials(request.memberName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{request.memberName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatSpecialty(request.sessionType)} • {request.duration}min
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {request.requestedDate.toLocaleDateString()} at {request.requestedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    {request.notes && (
                      <p className="text-xs text-muted-foreground mt-1 max-w-md">"{request.notes}"</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleAcceptRequest(request.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRejectRequest(request.id)}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* This Week's Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                This Week's Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weeksSessions.length > 0 ? (
                <div className="space-y-3">
                  {weeksSessions.slice(0, 5).map(session => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-center min-w-[60px]">
                          <div className="text-sm font-medium">
                            {new Date(session.scheduledDate).toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(session.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium">Client Session</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatSpecialty(session.sessionType_detail)} • {session.duration}min
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                          {session.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">${session.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No sessions scheduled for this week
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completion Rate</span>
                  <span className="font-bold">{trainer.completionRate}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${trainer.completionRate}%` }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Punctuality Score</span>
                  <span className="font-bold">{trainer.punctualityScore}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${trainer.punctualityScore}%` }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Client Satisfaction</span>
                  <span className="font-bold">{trainer.rating}/5</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{ width: `${(trainer.rating / 5) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Monthly Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{weeksSessions.length}</div>
                    <div className="text-xs text-muted-foreground">Sessions This Week</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{trainer.totalSessions}</div>
                    <div className="text-xs text-muted-foreground">Total Sessions</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      ${(monthlyRevenue / (weeksSessions.length || 1)).toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Session Value</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round((trainer.completionRate + trainer.punctualityScore + (trainer.rating * 20)) / 3)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Overall Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <TrainerSchedule trainerId={trainerId} />
        </TabsContent>

        <TabsContent value="clients">
          <ClientManagement trainerId={trainerId} />
        </TabsContent>

        <TabsContent value="earnings">
          <EarningsTracker trainerId={trainerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};