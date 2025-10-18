
import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  Shield, 
  UserCog, 
  Users, 
  User, 
  Dumbbell,
  Settings,
  BarChart2,
  FileText,
  CreditCard,
  Bell,
  MessageSquare,
  Calendar,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Award,
  Activity,
  Zap,
  Target,
  Trophy,
  HeartPulse,
  Stethoscope,
  Pill,
  Utensils,
  Dumbbell as DumbbellIcon,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  MessageSquare as MessageSquareIcon,
  Bell as BellIcon,
  Settings as SettingsIcon,
  BarChart2 as BarChart2Icon,
  FileText as FileTextIcon,
  CreditCard as CreditCardIcon,
  User as UserIcon,
  Users as UsersIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PermissionGate } from '@/components/PermissionGate';
import { useProfiles } from '@/hooks/useProfiles';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function UserManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const { toast } = useToast();
  const { data: profiles, isLoading } = useProfiles();
  
  const users = profiles || [];

  const handleEditUser = (user: any) => {
    navigate(`/users/${user.user_id}/edit`);
  };

  const handleDeleteUser = async (user: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `User ${user.full_name} has been deactivated`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to deactivate user',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = (user: any) => {
    navigate(`/users/${user.user_id}/profile`);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const getRoleIcon = (roleId: string) => {
    const icons: Record<string, JSX.Element> = {
      'super-admin': <Shield className="w-3.5 h-3.5 mr-1.5" />,
      'admin': <UserCog className="w-3.5 h-3.5 mr-1.5" />,
      'team-manager': <Users className="w-3.5 h-3.5 mr-1.5" />,
      'trainer': <DumbbellIcon className="w-3.5 h-3.5 mr-1.5" />,
      'staff': <User className="w-3.5 h-3.5 mr-1.5" />,
      'member': <UserIcon className="w-3.5 h-3.5 mr-1.5" />,
      'billing': <CreditCard className="w-3.5 h-3.5 mr-1.5" />,
      'reception': <ClipboardList className="w-3.5 h-3.5 mr-1.5" />,
      'dietitian': <Utensils className="w-3.5 h-3.5 mr-1.5" />,
      'physiotherapist': <Stethoscope className="w-3.5 h-3.5 mr-1.5" />,
      'yoga-instructor': <Activity className="w-3.5 h-3.5 mr-1.5" />,
      'pt-trainer': <Dumbbell className="w-3.5 h-3.5 mr-1.5" />,
      'group-fitness': <Users className="w-3.5 h-3.5 mr-1.5" />,
      'wellness-coach': <HeartPulse className="w-3.5 h-3.5 mr-1.5" />,
      'sales': <BarChart2 className="w-3.5 h-3.5 mr-1.5" />,
      'marketing': <MessageSquare className="w-3.5 h-3.5 mr-1.5" />,
      'events': <Calendar className="w-3.5 h-3.5 mr-1.5" />,
      'support': <Bell className="w-3.5 h-3.5 mr-1.5" />,
      'inventory': <FileText className="w-3.5 h-3.5 mr-1.5" />,
      'maintenance': <Settings className="w-3.5 h-3.5 mr-1.5" />
    };
    return icons[roleId] || <User className="w-3.5 h-3.5 mr-1.5" />;
  };

  const getRoleColor = (roleId: string) => {
    const colors: Record<string, string> = {
      'super-admin': 'destructive',
      'admin': 'default',
      'team-manager': 'secondary',
      'trainer': 'outline',
      'member': 'secondary',
      'staff': 'outline',
      'dietitian': 'secondary',
      'physiotherapist': 'secondary',
      'yoga-instructor': 'secondary',
      'pt-trainer': 'secondary',
      'group-fitness': 'secondary',
      'wellness-coach': 'secondary',
      'sales': 'secondary',
      'marketing': 'secondary',
      'events': 'secondary',
      'support': 'secondary',
      'inventory': 'secondary',
      'maintenance': 'secondary',
      'billing': 'secondary',
      'reception': 'secondary'
    };
    return colors[roleId] || 'secondary';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions across your organization
          </p>
        </div>
        <PermissionGate permission="users.create">
          <Button onClick={() => window.location.href = '/users/create'}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </PermissionGate>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : users.length}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : users.filter(u => u.is_active).length}</div>
            <p className="text-xs text-muted-foreground">98% active rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : users.filter(u => u.role === 'admin' || u.role === 'super-admin').length}
            </div>
            <p className="text-xs text-muted-foreground">System admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Users deactivated</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            A list of all users in your organization with their roles and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar_url} alt={user.full_name} />
                          <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getRoleColor(user.role) as any}
                        className="inline-flex items-center"
                      >
                        {getRoleIcon(user.role)}
                        {user.role}
                      </Badge>
                      {user.team_role && (
                        <Badge variant="outline" className="ml-2">
                          {user.team_role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.role === 'super-admin' || user.role === 'admin' ? (
                        <Badge variant="outline" className="text-xs">
                          All Branches
                        </Badge>
                      ) : user.branches?.name ? (
                        <div className="text-sm">{user.branches.name}</div>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Not Assigned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.department || 'Not specified'}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.last_login_at ? (
                        <div className="text-sm">
                          {new Date(user.last_login_at).toLocaleDateString()}
                          <div className="text-xs text-muted-foreground">
                            {new Date(user.last_login_at).toLocaleTimeString()}
                          </div>
                        </div>
                      ) : (
                        'Never'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                            <User className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <PermissionGate permission="users.edit">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                          </PermissionGate>
                          <DropdownMenuSeparator />
                          <PermissionGate permission="users.delete">
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Deactivate User
                            </DropdownMenuItem>
                          </PermissionGate>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
