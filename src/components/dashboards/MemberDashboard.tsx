
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Target,
  Star,
  Calendar,
  Trophy,
  TrendingUp,
  TrendingDown,
  Weight,
  Zap,
  MessageSquare,
  Plus,
  UserCheck,
  Clock,
  MapPin
} from 'lucide-react';
import { mockProgressSummary, mockMemberGoals } from '@/utils/mockData';
import { mockFeedback } from '@/utils/mockData';
import { useAuth } from '@/hooks/useAuth';
import { useRBAC } from '@/hooks/useRBAC';
import { PermissionGate } from '@/components/PermissionGate';

interface MemberDashboardProps {
  memberId: string;
  memberName: string;
  memberAvatar?: string;
}

export const MemberDashboard = ({ memberId, memberName, memberAvatar }: MemberDashboardProps) => {
  const { authState } = useAuth();
  const { hasPermission } = useRBAC();
  const progressSummary = mockProgressSummary[memberId];
  const memberGoals = mockMemberGoals.filter(g => g.memberId === memberId && g.status === 'active');
  const memberFeedback = mockFeedback.filter(f => f.memberId === memberId).slice(0, 2);

  const isCurrentMember = authState.user?.role === 'member';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isCurrentMember ? `Welcome back, ${memberName.split(' ')[0]}!` : `${memberName}'s Dashboard`}
          </h1>
          <p className="text-muted-foreground">
            {isCurrentMember ? 'Track your fitness journey and reach your goals' : 'Member progress and activity overview'}
          </p>
          {authState.user?.branchName && (
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{authState.user.branchName}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{isCurrentMember ? 'Member' : 'Profile View'}</Badge>
          {!isCurrentMember && (
            <PermissionGate permission="members.edit">
              <Button size="sm" variant="outline">Edit Profile</Button>
            </PermissionGate>
          )}
        </div>
      </div>
      
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-primary text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/90">This Month</CardTitle>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="text-2xl font-bold">{progressSummary?.visitsThisMonth || 0}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-white/70">Gym visits</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-secondary text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/90">Weight Progress</CardTitle>
            <div className="flex items-center gap-2">
              <Weight className="w-4 h-4" />
              <span className="text-2xl font-bold">
                {progressSummary?.currentWeight || '--'} kg
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              {progressSummary?.weightChange && progressSummary.weightChange < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              <p className="text-xs text-white/70">
                {progressSummary?.weightChange ? 
                  `${progressSummary.weightChange > 0 ? '+' : ''}${progressSummary.weightChange}kg` : 
                  'No change'
                }
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Streak</CardTitle>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-warning" />
              <span className="text-2xl font-bold text-foreground">
                {progressSummary?.consecutiveDays || 0}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Average</CardTitle>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                {progressSummary?.averageVisitsPerWeek?.toFixed(1) || '0.0'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Visits per week</p>
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress */}
      {memberGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {isCurrentMember ? 'Your Active Goals' : `${memberName.split(' ')[0]}'s Goals`}
            </CardTitle>
            <CardDescription>
              {isCurrentMember ? 'Your current fitness goals and progress' : 'Current fitness objectives and progress'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {memberGoals.map((goal) => {
              const progress = goal.currentValue && goal.targetValue 
                ? (goal.currentValue / goal.targetValue) * 100 
                : 0;
              
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{goal.title}</p>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(progress)}% complete
                      </p>
                    </div>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                {isCurrentMember ? 'My Recent Feedback' : 'Recent Feedback'}
              </CardTitle>
              {isCurrentMember && (
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Give Feedback
                </Button>
              )}
            </div>
            <CardDescription>
              {isCurrentMember ? 'Your recent feedback and responses' : 'Member feedback history'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {memberFeedback.length > 0 ? (
              memberFeedback.map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= feedback.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {feedback.type}
                      </Badge>
                    </div>
                    <Badge variant={feedback.status === 'resolved' ? 'secondary' : 'default'} className="text-xs">
                      {feedback.status}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm mb-1">{feedback.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {feedback.description}
                  </p>
                  {feedback.adminResponse && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      <span className="font-medium">Response:</span> {feedback.adminResponse}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {isCurrentMember ? "You haven't given any feedback yet." : "No feedback submitted yet."}
                </p>
                {isCurrentMember && (
                  <p className="text-xs">Share your experience to help us improve!</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements & Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: 'First Week Complete', description: 'Completed 7 consecutive days', earned: true },
              { title: 'Weight Loss Milestone', description: 'Lost 3kg since joining', earned: progressSummary?.weightChange && progressSummary.weightChange <= -3 },
              { title: 'Consistency Champion', description: '20 visits this month', earned: progressSummary?.visitsThisMonth && progressSummary.visitsThisMonth >= 20 }
            ].map((achievement, index) => (
              <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${achievement.earned ? 'bg-yellow-50 border border-yellow-200' : 'bg-muted'}`}>
                <Trophy className={`w-6 h-6 ${achievement.earned ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                <div>
                  <p className="font-medium">{achievement.title}</p>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Only for current member */}
      {isCurrentMember && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Classes</CardTitle>
              <CardDescription>Your booked sessions this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: 'Today', time: '6:00 PM', class: 'Yoga Flow', instructor: 'Sarah M.' },
                  { date: 'Tomorrow', time: '7:00 AM', class: 'HIIT Training', instructor: 'Mike R.' },
                  { date: 'Wed', time: '5:30 PM', class: 'Strength Training', instructor: 'Alex K.' }
                ].map((booking, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{booking.class}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.date} at {booking.time} • {booking.instructor}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Cancel
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Start your fitness journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => window.location.href = '/member/classes'}
                >
                  <Calendar className="w-6 h-6" />
                  <span className="text-sm">Book Class</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => window.location.href = '/member/goals'}
                >
                  <Target className="w-6 h-6" />
                  <span className="text-sm">Set Goals</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => window.location.href = '/member/progress'}
                >
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-sm">View Progress</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => window.location.href = '/member/feedback'}
                >
                  <MessageSquare className="w-6 h-6" />
                  <span className="text-sm">Give Feedback</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
