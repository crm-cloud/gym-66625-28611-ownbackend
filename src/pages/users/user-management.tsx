import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Search, 
  Users, 
  Building, 
  Dumbbell,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Activity,
  Crown,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency } from '@/hooks/useCurrency';
import { useRecentInvoices } from '@/hooks/useInvoices';

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  role: string;
  status: string;
  created_at: string;
  last_login?: string;
  gym_id?: string;
  gym_name?: string;
  branches_count?: number;
  trainers_count?: number;
  members_count?: number;
  branch_id?: string;
  department?: string;
}

interface BranchDetail {
  id: string;
  name: string;
  address: any;
  status: string;
  current_members: number;
  capacity: number;
  trainers_count: number;
  created_at: string;
}

export default function UserManagement() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const { formatCurrency } = useCurrency();

  // Fetch admin users list
  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          email,
          phone,
          avatar_url,
          role,
          is_active,
          created_at,
          gym_id,
          branch_id,
          gyms!inner(
            name
          )
        `)
        .in('role', ['admin', 'super-admin'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data and add additional counts
      const transformedData = await Promise.all(
        (data || []).map(async (user) => {
          // Get branches count for this user's gym
          const { count: branchesCount } = await supabase
            .from('branches')
            .select('*', { count: 'exact', head: true })
            .eq('gym_id', user.gym_id)
            .eq('status', 'active');

          // Get trainers count for this user's gym
          const { count: trainersCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('gym_id', user.gym_id)
            .eq('role', 'trainer')
            .eq('is_active', true);

          // Get members count for this user's gym  
          const { count: membersCount } = await supabase
            .from('members')
            .select('*', { count: 'exact', head: true })
            .eq('membership_status', 'active');

          return {
            id: user.user_id,
            full_name: user.full_name || '',
            email: user.email || '',
            phone: user.phone || '',
            avatar_url: user.avatar_url,
            role: user.role,
            status: user.is_active ? 'active' : 'inactive',
            created_at: user.created_at,
            gym_id: user.gym_id,
            gym_name: (user.gyms as any)?.name || 'No Gym',
            branches_count: branchesCount || 0,
            trainers_count: trainersCount || 0,
            members_count: membersCount || 0,
            branch_id: user.branch_id,
            department: 'Not specified'
          } as AdminUser;
        })
      );

      return transformedData;
    }
  });

  // Fetch specific user details when userId is provided
  const { data: selectedUser } = useQuery<AdminUser & { branches: BranchDetail[] }>({
    queryKey: ['user-detail', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const user = users?.find(u => u.id === userId);
      if (!user) return null;

      // Get branches for this user's gym
      const { data: branches, error } = await supabase
        .from('branches')
        .select(`
          id,
          name,
          address,
          status,
          current_members,
          capacity,
          created_at
        `)
        .eq('gym_id', user.gym_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Add trainer counts to branches
      const branchesWithCounts = await Promise.all(
        (branches || []).map(async (branch) => {
          const { count: trainersCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('branch_id', branch.id)
            .eq('role', 'trainer')
            .eq('is_active', true);

          return {
            ...branch,
            trainers_count: trainersCount || 0
          };
        })
      );

      return {
        ...user,
        branches: branchesWithCounts
      };
    },
    enabled: !!userId && (users?.length || 0) > 0
  });

  // Fetch recent invoices for the selected user's gym
  const { data: recentInvoices = [], isLoading: invoicesLoading } = useRecentInvoices(
    selectedUser?.gym_id, 
    3 // Limit to 3 recent invoices
  );

  // Filter users
  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.gym_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Get statistics
  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter(u => u.status === 'active').length || 0;
  const superAdmins = users?.filter(u => u.role === 'super-admin').length || 0;
  const admins = users?.filter(u => u.role === 'admin').length || 0;

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super-admin': return Crown;
      case 'admin': return Shield;
      default: return Users;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super-admin': return 'default' as const;
      case 'admin': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default' as const;
      case 'inactive': return 'secondary' as const;
      case 'suspended': return 'destructive' as const;
      default: return 'outline' as const;
    }
  };

  // If viewing a specific user, show detail view
  if (userId && selectedUser) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center gap-4 p-6 border-b bg-card">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/users/user-management')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">User Details</h1>
            <p className="text-muted-foreground">View and manage user information</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {getInitials(selectedUser.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{selectedUser.full_name}</h2>
                    <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                      {selectedUser.role}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(selectedUser.status)}>
                      {selectedUser.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {selectedUser.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {selectedUser.phone || 'No phone'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {selectedUser.gym_name}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Tabs for different views */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="branches">Branches</TabsTrigger>
              <TabsTrigger value="billing">Billing & Plans</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedUser.branches_count}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Trainers</CardTitle>
                    <Dumbbell className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedUser.trainers_count}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedUser.members_count}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Last Login</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      Never
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <p className="text-sm text-muted-foreground">{selectedUser.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Role</label>
                      <p className="text-sm text-muted-foreground">{selectedUser.role}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <p className="text-sm text-muted-foreground">{selectedUser.status}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Department</label>
                      <p className="text-sm text-muted-foreground">{selectedUser.department || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Created</label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedUser.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branches" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Managed Branches</CardTitle>
                  <CardDescription>
                    Branches under this user's gym management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedUser.branches && selectedUser.branches.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Branch Name</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Members</TableHead>
                          <TableHead>Trainers</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUser.branches.map((branch: BranchDetail) => (
                          <TableRow key={branch.id}>
                            <TableCell className="font-medium">{branch.name}</TableCell>
                            <TableCell>
                              {typeof branch.address === 'object' 
                                ? `${(branch.address as any)?.street || ''}, ${(branch.address as any)?.city || ''}`
                                : branch.address || 'No address'
                              }
                            </TableCell>
                            <TableCell>
                              <Badge variant={branch.status === 'active' ? 'default' : 'secondary'}>
                                {branch.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{branch.current_members} / {branch.capacity}</TableCell>
                            <TableCell>{branch.trainers_count}</TableCell>
                            <TableCell>{new Date(branch.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No branches found for this user's gym
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Current Plan Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>
                      {selectedUser.gym_name} subscription details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Plan Type</span>
                        <Badge variant="default">Professional</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Standard plan for growing businesses
                      </p>
                    </div>
                    
                    <div>
          <span className="text-sm font-medium">Price</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{formatCurrency(99)}</span>
            <span className="text-sm text-muted-foreground">per month</span>
          </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium">Status</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default">Active</Badge>
                        <span className="text-sm text-muted-foreground">
                          Until Dec 09, 2024
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm">Upgrade Plan</Button>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Usage & Limits */}
                <Card>
                  <CardHeader>
                    <CardTitle>Usage & Limits</CardTitle>
                    <CardDescription>
                      Current usage against plan limits
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Branches</span>
                        <span>{selectedUser.branches_count} of 10</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(selectedUser.branches_count || 0) / 10 * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Trainers</span>
                        <span>{selectedUser.trainers_count} of 50</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(selectedUser.trainers_count || 0) / 50 * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Members</span>
                        <span>{selectedUser.members_count} of 1000</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(selectedUser.members_count || 0) / 1000 * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Manage payment methods for this gym
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                          VISA
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-muted-foreground">Expires 12/24</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Primary</Badge>
                        <Button size="sm" variant="ghost">Edit</Button>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      + Add Payment Method
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Billing History */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>
                    Latest billing transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invoicesLoading ? (
                      // Loading state
                      [...Array(3)].map((_, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded animate-pulse">
                          <div className="space-y-1">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                          <div className="space-y-1 text-right">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                            <div className="h-5 bg-gray-200 rounded w-12"></div>
                          </div>
                        </div>
                      ))
                    ) : recentInvoices.length > 0 ? (
                      recentInvoices.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-muted-foreground">{invoice.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                            <Badge variant={invoice.status === 'Paid' ? 'default' : 'destructive'}>
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      // No invoices state
                      <div className="text-center py-4 text-muted-foreground">
                        <p>No recent invoices found for this gym.</p>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" className="w-full mt-3"
                    onClick={() => window.location.href = '/finance/invoices'}
                  >
                    View All Invoices
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Menu</h1>
          <p className="text-muted-foreground">Manage admin accounts and their details</p>
        </div>
        <Button onClick={() => navigate('/users/create')}>
          <Users className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{superAdmins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super-admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Gym</TableHead>
                  <TableHead>Branches</TableHead>
                  <TableHead>Trainers</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  
                  return (
                    <TableRow 
                      key={user.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/users/user-management/${user.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.full_name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <RoleIcon className="h-4 w-4" />
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{user.gym_name}</TableCell>
                      <TableCell>{user.branches_count}</TableCell>
                      <TableCell>{user.trainers_count}</TableCell>
                      <TableCell>{user.members_count}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        Never
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/users/user-management/${user.id}`);
                              }}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/users/edit/${user.id}`);
                              }}
                            >
                              Edit User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          
          {!isLoading && filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || roleFilter !== 'all' 
                ? 'No users found matching your filters' 
                : 'No admin users found'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}