import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, UserCheck, UserX, Shield } from 'lucide-react';
import { TeamMemberForm } from '@/components/team/TeamMemberForm';
import { TeamMemberTable } from '@/components/team/TeamMemberTable';
import { TeamFiltersComponent, TeamFilters } from '@/components/team/TeamFilters';
import { PermissionGate } from '@/components/PermissionGate';
import { useAuth } from '@/hooks/useAuth';
import { useBranchContext } from '@/hooks/useBranchContext';
import { useRBAC } from '@/hooks/useRBAC';
import { useToast } from '@/hooks/use-toast';
import { useTeamMembers, TeamMember } from '@/hooks/useTeamMembers';

export default function TeamManagement() {
  const { authState } = useAuth();
  const { currentBranchId } = useBranchContext();
  const { hasPermission } = useRBAC();
  const { toast } = useToast();

  const {
    teamMembers,
    isLoading,
    createTeamMember,
    updateTeamMember,
    toggleMemberStatus,
    resetPassword,
    isCreating,
    isUpdating
  } = useTeamMembers();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | undefined>();
  const [filters, setFilters] = useState<TeamFilters>({
    search: '',
    role: 'all',
    branch: 'all',
    status: 'all',
  });

  const isAdmin = authState.user?.role === 'admin' || authState.user?.role === 'super-admin';

  // Apply filtering
  const visibleMembers = useMemo(() => {
    let filtered = teamMembers;

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(member =>
        member.full_name.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower) ||
        (member.phone && member.phone.includes(filters.search))
      );
    }

    // Apply role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(member => member.role === filters.role);
    }

    // Apply branch filter (only for admin)
    if (filters.branch !== 'all' && isAdmin) {
      filtered = filtered.filter(member => member.branch_id === filters.branch);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      const isActive = filters.status === 'active';
      filtered = filtered.filter(member => member.is_active === isActive);
    }

    return filtered;
  }, [teamMembers, filters, isAdmin]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: teamMembers.length,
      active: teamMembers.filter(m => m.is_active).length,
      managers: teamMembers.filter(m => m.role === 'manager').length,
      inactive: teamMembers.filter(m => !m.is_active).length,
    };
  }, [teamMembers]);

  const handleCreateMember = (data: any) => {
    createTeamMember({
      full_name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      branch_id: data.branchId,
      password: data.password || 'TempPass123!' // Should be generated or required
    });
    setShowCreateForm(false);
  };

  const handleEditMember = (data: any) => {
    if (!editingMember) return;

    updateTeamMember({
      id: editingMember.id,
      full_name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      branch_id: data.branchId,
      is_active: data.status === 'active'
    });
    setEditingMember(undefined);
  };

  const handleViewMember = (member: TeamMember) => {
    toast({
      title: 'Member Details',
      description: `Viewing details for ${member.full_name}`,
    });
  };

  const handleDisableMember = (member: TeamMember) => {
    toggleMemberStatus(member);
  };

  const handleResetPassword = (member: TeamMember) => {
    resetPassword(member.email);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading team members...</p>
        </div>
      </div>
    );
  }

  // Convert team members to match table interface
  const tableMembers = visibleMembers.map(member => ({
    id: member.id,
    name: member.full_name,
    email: member.email,
    phone: member.phone || '',
    role: member.role as any,
    branchId: member.branch_id || '',
    branchName: member.branches?.name || '',
    status: member.is_active ? 'active' as const : 'inactive' as const,
    avatar: member.avatar_url,
    createdAt: new Date(member.created_at),
    lastLogin: undefined
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage staff, trainers, and managers across your organization
          </p>
        </div>
        <PermissionGate permission="team.create">
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        </PermissionGate>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? 'All branches' : 'Current branch'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.managers}</div>
            <p className="text-xs text-muted-foreground">
              Management staff
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              Disabled accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <TeamFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={visibleMembers.length}
      />

      {/* Team Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your team members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamMemberTable
            members={tableMembers}
            onView={(member) => {
              const teamMember = teamMembers.find(tm => tm.id === member.id);
              if (teamMember) handleViewMember(teamMember);
            }}
            onEdit={(member) => {
              const teamMember = teamMembers.find(tm => tm.id === member.id);
              setEditingMember(teamMember);
            }}
            onDisable={(member) => {
              const teamMember = teamMembers.find(tm => tm.id === member.id);
              if (teamMember) handleDisableMember(teamMember);
            }}
            onResetPassword={(member) => {
              const teamMember = teamMembers.find(tm => tm.id === member.id);
              if (teamMember) handleResetPassword(teamMember);
            }}
          />
        </CardContent>
      </Card>

      {/* Create Form */}
      <TeamMemberForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={handleCreateMember}
      />

      {/* Edit Form */}
      <TeamMemberForm
        open={!!editingMember}
        onOpenChange={(open) => !open && setEditingMember(undefined)}
        member={editingMember ? {
          id: editingMember.id,
          name: editingMember.full_name,
          email: editingMember.email,
          phone: editingMember.phone || '',
          role: editingMember.role as any,
          branchId: editingMember.branch_id || '',
          branchName: editingMember.branches?.name || '',
          status: editingMember.is_active ? 'active' : 'inactive',
          avatar: editingMember.avatar_url,
          createdAt: new Date(editingMember.created_at)
        } : undefined}
        onSubmit={handleEditMember}
      />
    </div>
  );
}