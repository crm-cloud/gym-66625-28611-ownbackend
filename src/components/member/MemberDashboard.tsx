import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Calendar, CreditCard, User, Activity, Zap, TrendingUp, Users } from 'lucide-react';
import { AssignMembershipDrawer } from '@/components/membership/AssignMembershipDrawer';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useMembershipPlans, useMembers } from '@/hooks/useSupabaseQuery';
import { format, differenceInDays } from 'date-fns';

interface MemberDashboardProps {
  memberId?: string;
}

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export const MemberDashboard = ({ memberId }: MemberDashboardProps) => {
  const { authState } = useAuth();
  const [showAssignMembership, setShowAssignMembership] = useState(false);
  
  const { data: members = [] } = useMembers();
  const { data: membershipPlans = [] } = useMembershipPlans();

  // Find the current member
  const currentMember = memberId 
    ? members.find(m => m.id === memberId)
    : members.find(m => m.user_id === authState.user?.id);

  if (!currentMember) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Member Profile Not Found</h3>
          <p className="text-muted-foreground">Unable to load member information.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getDaysUntilExpiry = (endDate: string): number => {
    return differenceInDays(new Date(endDate), new Date());
  };

  const getMembershipStatusInfo = (member: any) => {
    // This would typically come from member_memberships table
    // For now, using mock logic
    const hasActiveMembership = member.membership_status === 'active';
    
    if (!hasActiveMembership) {
      return {
        message: "No active membership",
        color: "destructive" as const,
        showGetMembership: true
      };
    }

    // Mock membership end date (would come from actual membership record)
    const mockEndDate = new Date();
    mockEndDate.setMonth(mockEndDate.getMonth() + 1);
    const daysUntilExpiry = getDaysUntilExpiry(mockEndDate.toISOString());

    if (daysUntilExpiry <= 7) {
      return {
        message: `Expires in ${daysUntilExpiry} days`,
        color: "destructive" as const,
        showRenew: true
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        message: `Expires in ${daysUntilExpiry} days`,
        color: "secondary" as const,
        showRenew: true
      };
    } else {
      return {
        message: `Active until ${format(mockEndDate, 'MMM dd, yyyy')}`,
        color: "default" as const
      };
    }
  };

  const membershipStatus = getMembershipStatusInfo(currentMember);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={currentMember.profile_photo} />
          <AvatarFallback className="text-lg">
            {getInitials(currentMember.full_name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {currentMember.full_name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Ready to crush your fitness goals today?</p>
        </div>
      </div>

      {/* Membership Alert */}
      {membershipStatus.showGetMembership && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>You don't have an active membership. Get one now to access all gym facilities!</span>
            <Button 
              size="sm" 
              onClick={() => setShowAssignMembership(true)}
              className="ml-4"
            >
              Get Membership
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Membership Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Membership
          </CardTitle>
          <CardDescription>Your membership details and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Plan:</span>
                <span>{currentMember.membership_plan || 'No active plan'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <Badge variant={membershipStatus.color}>
                  {membershipStatus.message}
                </Badge>
              </div>
            </div>
            {membershipStatus.showRenew && (
              <Button 
                variant="outline" 
                onClick={() => setShowAssignMembership(true)}
              >
                Renew Membership
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Fast access to key features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-16 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              Book Classes
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <User className="h-6 w-6 mb-2" />
              Update Profile
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              View Progress
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your latest gym activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Last Check-in</p>
                  <p className="text-sm text-muted-foreground">Today at 9:30 AM</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Yoga Class</p>
                  <p className="text-sm text-muted-foreground">Yesterday at 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assign Membership Drawer */}
      {showAssignMembership && (
        <AssignMembershipDrawer
          open={showAssignMembership}
          onClose={() => setShowAssignMembership(false)}
          memberName={currentMember.full_name}
          onSubmit={(data) => {
            console.log('Membership data:', data);
            // TODO: Implement actual membership assignment
            toast({
              title: "Success",
              description: "Membership assigned successfully!",
            });
            setShowAssignMembership(false);
          }}
        />
      )}
    </div>
  );
};