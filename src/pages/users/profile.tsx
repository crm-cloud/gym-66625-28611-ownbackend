import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { useProfile } from '@/hooks/useProfiles';
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, User, Shield } from 'lucide-react';

interface UserProfile {
  user_id?: string;
  avatar_url?: string;
  full_name?: string;
  email?: string;
  role?: string;
  team_role?: string;
  is_active?: boolean;
  phone?: string;
  branches?: { name: string };
  created_at?: string;
  last_login_at?: string;
}

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: userData, isLoading: loading, error } = useProfile(userId);
  const user = userData as UserProfile | undefined;

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load user data',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'super-admin': 'destructive',
      'admin': 'default',
      'team': 'secondary',
      'member': 'outline'
    };
    return colors[role] || 'secondary';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
        <p className="text-muted-foreground mb-4">The requested user could not be found.</p>
        <Button onClick={() => navigate('/users')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/users')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">User Profile</h1>
            <p className="text-muted-foreground">View user information and activity</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/users/${userId}/edit`)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit User
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src={user?.avatar_url} alt={user?.full_name || 'User'} />
              <AvatarFallback className="text-2xl">
                {getInitials(user?.full_name || 'User')}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{user?.full_name || 'Unknown User'}</CardTitle>
            <CardDescription>{user?.email || 'No email'}</CardDescription>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant={getRoleColor(user?.role || 'member') as any} className="inline-flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                {user?.role || 'member'}
              </Badge>
              {user?.team_role && (
                <Badge variant="outline">
                  {user.team_role}
                </Badge>
              )}
              <Badge variant={user?.is_active ? 'default' : 'secondary'}>
                {user?.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Personal and account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user?.email || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{user?.phone || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    <p className="text-sm text-muted-foreground">{user?.role || 'member'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Branch</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.role === 'super-admin' || user?.role === 'admin' 
                        ? 'All Branches' 
                        : user?.branches?.name || 'Not assigned'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Login</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.last_login_at 
                        ? new Date(user.last_login_at).toLocaleString()
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity & Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
          <CardDescription>Recent activity and system usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4" />
            <p>Activity tracking coming soon</p>
            <p className="text-sm mt-1">This will show login history, actions performed, and system usage metrics</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}