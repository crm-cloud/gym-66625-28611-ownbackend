
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Permission, RoleDefinition, UserWithRoles, AuditLog, type RBACContext as RBACContextType } from '@/types/rbac';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';

// Role definitions - metadata only (permissions fetched from database)
const mockRoles: Record<string, RoleDefinition> = {
  'super-admin': {
    id: 'super-admin',
    name: 'Super Administrator',
    description: 'Platform owner with SaaS management access',
    color: '#dc2626',
    isSystem: true,
    scope: 'global',
    permissions: [], // Permissions loaded from database
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  'admin': {
    id: 'admin',
    name: 'Administrator',
    description: 'Full gym operational access across branches',
    color: '#ea580c',
    isSystem: true,
    scope: 'global',
    permissions: [], // Permissions loaded from database
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  'team-manager': {
    id: 'team-manager',
    name: 'Team Manager',
    description: 'Branch management and team oversight',
    color: '#0ea5e9',
    isSystem: true,
    scope: 'branch',
    permissions: [], // Permissions loaded from database
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  'team-trainer': {
    id: 'team-trainer',
    name: 'Team Trainer',
    description: 'Trainer-specific access for classes and client management',
    color: '#16a34a',
    isSystem: true,
    scope: 'branch',
    permissions: [], // Permissions loaded from database
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  'team-staff': {
    id: 'team-staff',
    name: 'Team Staff',
    description: 'Staff-specific access for front desk and member support',
    color: '#7c3aed',
    isSystem: true,
    scope: 'branch',
    permissions: [], // Permissions loaded from database
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  'member': {
    id: 'member',
    name: 'Member',
    description: 'Basic member access for personal use',
    color: '#dc2626',
    isSystem: true,
    scope: 'self',
    permissions: [], // Permissions loaded from database
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  }
};

// Updated mock users with role-specific assignments
const mockUsersWithRoles: Record<string, UserWithRoles> = {
  'rajat.lekhari@hotmail.com': {
    id: 'rajat-lekhari',
    email: 'rajat.lekhari@hotmail.com',
    name: 'Rajat Lekhari',
    role: 'super-admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    department: 'System Administration',
    phone: '+1 (555) 000-0001',
    joinDate: '2022-01-01',
    roles: [mockRoles['super-admin']],
    isActive: true,
    lastLogin: new Date(),
    createdBy: 'system',
    assignedBranches: ['all']
  },
  'superadmin@gymfit.com': {
    id: '0',
    email: 'superadmin@gymfit.com',
    name: 'David Thompson',
    role: 'super-admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    department: 'System Administration',
    phone: '+1 (555) 000-0000',
    joinDate: '2022-01-01',
    roles: [mockRoles['super-admin']],
    isActive: true,
    lastLogin: new Date(),
    createdBy: 'system',
    assignedBranches: ['all']
  },
  'admin@gymfit.com': {
    id: '1',
    email: 'admin@gymfit.com',
    name: 'Sarah Johnson',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612c2be?w=150&h=150&fit=crop&crop=face',
    department: 'Management',
    phone: '+1 (555) 123-4567',
    joinDate: '2023-01-15',
    roles: [mockRoles['admin']],
    isActive: true,
    lastLogin: new Date(),
    createdBy: 'superadmin@gymfit.com',
    assignedBranches: ['all']
  },
  'manager@gymfit.com': {
    id: '2',
    email: 'manager@gymfit.com',
    name: 'Robert Kim',
    role: 'team',
    teamRole: 'manager',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    department: 'Operations',
    phone: '+1 (555) 111-2222',
    joinDate: '2023-02-10',
    branchId: 'branch_1',
    branchName: 'Downtown Branch',
    roles: [mockRoles['team-manager']],
    isActive: true,
    lastLogin: new Date(Date.now() - 30 * 60 * 1000),
    createdBy: 'admin@gymfit.com',
    primaryBranchId: 'branch_1'
  },
  'staff@gymfit.com': {
    id: '3',
    email: 'staff@gymfit.com',
    name: 'Lisa Chen',
    role: 'team',
    teamRole: 'staff',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    department: 'Front Desk',
    phone: '+1 (555) 222-3333',
    joinDate: '2023-04-15',
    branchId: 'branch_1',
    branchName: 'Downtown Branch',
    roles: [mockRoles['team-staff']],
    isActive: true,
    lastLogin: new Date(Date.now() - 60 * 60 * 1000),
    createdBy: 'manager@gymfit.com',
    primaryBranchId: 'branch_1'
  },
  'trainer@gymfit.com': {
    id: '4',
    email: 'trainer@gymfit.com',
    name: 'Mike Rodriguez',
    role: 'team',
    teamRole: 'trainer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    department: 'Personal Training',
    phone: '+1 (555) 234-5678',
    joinDate: '2023-03-20',
    branchId: 'branch_1',
    branchName: 'Downtown Branch',
    roles: [mockRoles['team-trainer']],
    isActive: true,
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdBy: 'manager@gymfit.com',
    primaryBranchId: 'branch_1'
  },
  'member@gymfit.com': {
    id: '5',
    email: 'member@gymfit.com',
    name: 'Emily Chen',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    phone: '+1 (555) 345-6789',
    joinDate: '2023-06-10',
    branchId: 'branch_1',
    branchName: 'Downtown Branch',
    roles: [mockRoles['member']],
    isActive: true,
    lastLogin: new Date(Date.now() - 30 * 60 * 1000),
    createdBy: 'staff@gymfit.com',
    primaryBranchId: 'branch_1'
  }
};

const RBACContext = createContext<RBACContextType | null>(null);

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within RBACProvider');
  }
  return context;
};

// Role to permission mapping for database roles
const getRolePermissions = (role: UserRole, teamRole?: string): Permission[] => {
  switch (role) {
    case 'super-admin':
      return mockRoles['super-admin'].permissions;
    case 'admin':
      return mockRoles['admin'].permissions;
    case 'team':
      switch (teamRole) {
        case 'manager':
          return mockRoles['team-manager'].permissions;
        case 'trainer':
          return mockRoles['team-trainer'].permissions;
        case 'staff':
          return mockRoles['team-staff'].permissions;
        default:
          return [];
      }
    case 'member':
      return mockRoles['member'].permissions;
    default:
      return [];
  }
};

const getUserRoleDefinition = (role: UserRole, teamRole?: string): RoleDefinition => {
  switch (role) {
    case 'super-admin':
      return mockRoles['super-admin'];
    case 'admin':
      return mockRoles['admin'];
    case 'team':
      switch (teamRole) {
        case 'manager':
          return mockRoles['team-manager'];
        case 'trainer':
          return mockRoles['team-trainer'];
        case 'staff':
          return mockRoles['team-staff'];
        default:
          return mockRoles['member']; // fallback
      }
    case 'member':
      return mockRoles['member'];
    default:
      return mockRoles['member'];
  }
};

export const RBACProvider = ({ children }: { children: ReactNode }) => {
  const { authState } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserWithRoles | null>(null);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Fetch roles and permissions from database
  useEffect(() => {
    const loadUserWithRolesAndPermissions = async () => {
      setIsLoadingPermissions(true);
      
      if (!authState.user) {
        setCurrentUser(null);
        setUserRoles([]);
        setUserPermissions([]);
        setIsLoadingPermissions(false);
        return;
      }

      try {
        // Step 1: Fetch roles from user_roles table
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role, team_role, branch_id')
          .eq('user_id', authState.user.id);

        if (rolesError) {
          console.error('Error fetching user roles:', rolesError);
          setUserRoles([]);
          setUserPermissions([]);
        } else {
          console.log('🔍 [RBAC Debug] User Roles Loaded:', {
            userId: authState.user.id,
            email: authState.user.email,
            rolesData,
            rolesCount: rolesData?.length || 0
          });
          setUserRoles(rolesData || []);

          // Step 2: Fetch permissions for these roles from database
          if (rolesData && rolesData.length > 0) {
            // Get role IDs from roles table based on role names
            const roleNames = rolesData.map(r => {
              if (r.role === 'team' && r.team_role) {
                return `team-${r.team_role}`;
              }
              return r.role;
            });

            const { data: roleRecords } = await supabase
              .from('roles')
              .select('id, name')
              .in('name', roleNames);

            if (roleRecords && roleRecords.length > 0) {
              const roleIds = roleRecords.map(r => r.id);

              // Fetch permissions via role_permissions junction table
              const { data: permissionsData, error: permissionsError } = await supabase
                .from('role_permissions')
                .select(`
                  permissions (
                    name
                  )
                `)
                .in('role_id', roleIds);

              if (permissionsError) {
                console.error('❌ [RBAC] Failed to fetch permissions:', permissionsError);
                setUserPermissions([]);
              } else {
                // Extract permission names
                const permissions = permissionsData
                  .map(rp => (rp.permissions as any)?.name)
                  .filter(Boolean) as Permission[];

                console.log('✅ [RBAC] Permissions loaded from database:', {
                  permissionsCount: permissions.length,
                  samplePermissions: permissions.slice(0, 5)
                });

                setUserPermissions(permissions);
              }
            } else {
              console.warn('⚠️ [RBAC] No role records found in database');
              setUserPermissions([]);
            }
          }
        }

        // Step 3: Fetch profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', authState.user.id)
          .maybeSingle();

        if (profile && rolesData && rolesData.length > 0) {
          // Build roles array from user_roles data
          const roles = rolesData.map(r => {
            if (r.role === 'team' && r.team_role) {
              const teamRoleKey = `team-${r.team_role}` as keyof typeof mockRoles;
              return mockRoles[teamRoleKey];
            }
            return mockRoles[r.role];
          }).filter(Boolean);
          
          // Extract team_role if user has team role
          const teamRoleData = rolesData.find(r => r.role === 'team');
          const teamRole = teamRoleData?.team_role as 'manager' | 'trainer' | 'staff' | undefined;
          
          const userWithRoles: UserWithRoles = {
            id: profile.user_id,
            email: profile.email,
            name: profile.full_name,
            role: rolesData[0].role as UserRole,
            avatar: profile.avatar_url,
            phone: profile.phone,
            joinDate: profile.created_at?.split('T')[0],
            branchId: profile.branch_id,
            branchName: authState.user.branchName,
            teamRole: teamRole,
            roles: roles,
            isActive: profile.is_active,
            lastLogin: new Date(),
            assignedBranches: rolesData.map(r => r.branch_id).filter(Boolean),
            primaryBranchId: profile.branch_id
          };
          setCurrentUser(userWithRoles);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error loading user roles and permissions:', error);
        setCurrentUser(null);
        setUserRoles([]);
        setUserPermissions([]);
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    loadUserWithRolesAndPermissions();
  }, [authState.user]);

  const getUserPermissions = (): Permission[] => {
    if (!currentUser) {
      return [];
    }

    // Add custom permissions if any
    const permissions = new Set(userPermissions);
    
    if (currentUser.customPermissions) {
      currentUser.customPermissions.forEach(permission => permissions.add(permission));
    }

    // Remove denied permissions
    if (currentUser.deniedPermissions) {
      currentUser.deniedPermissions.forEach(permission => permissions.delete(permission));
    }

    return Array.from(permissions);
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;

    // Super admin has all permissions
    if (currentUser.role === 'super-admin') return true;

    // TEMPORARY OVERRIDE: Allow admin full access when permissions haven't loaded yet
    // This will be removed once DB permissions are properly seeded
    if (currentUser.role === 'admin' && userPermissions.length === 0) {
      console.log('⚠️ [RBAC] Temporary admin override active - granting permission:', permission);
      return true;
    }

    // Check against database-loaded permissions
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const canAccessResource = (resource: string, action: string): boolean => {
    const permission = `${resource}.${action}` as Permission;
    return hasPermission(permission);
  };

  const canAccessBranch = (branchId: string): boolean => {
    if (!currentUser) return false;
    
    // Super Admin and Admin can access all branches
    if (currentUser.role === 'super-admin' || currentUser.role === 'admin') {
      return true;
    }
    
    // Team and Member are restricted to their assigned branch
    return currentUser.branchId === branchId;
  };

  const getCurrentBranchId = (): string | null => {
    return currentUser?.branchId || null;
  };

  const isTrainer = (): boolean => {
    return currentUser?.role === 'team' && currentUser?.teamRole === 'trainer';
  };

  const isStaff = (): boolean => {
    return currentUser?.role === 'team' && currentUser?.teamRole === 'staff';
  };

  const isManager = (): boolean => {
    return currentUser?.role === 'team' && currentUser?.teamRole === 'manager';
  };

  const value: RBACContextType = {
    currentUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    canAccessResource,
    canAccessBranch,
    getCurrentBranchId,
    isTrainer,
    isStaff,
    isManager,
    isLoadingPermissions
  };

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
};

// Export roles and users for admin management
export { mockRoles, mockUsersWithRoles };
