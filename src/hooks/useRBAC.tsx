
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Permission, RoleDefinition, UserWithRoles, AuditLog, type RBACContext as RBACContextType } from '@/types/rbac';
import { useAuth } from './useAuth';
import { api } from '@/lib/axios';
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
    case 'super_admin':
      // Super admin gets all permissions
      return Object.values(mockRoles).flatMap(roleDef => roleDef.permissions || []);
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
    case 'super_admin':
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

export const RBACProvider = ({ children }: { children: React.ReactNode }) => {
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  // Define default permissions that all authenticated users should have
  const defaultPermissions: Permission[] = ['dashboard.view'];
  const [permissions, setPermissions] = useState<Permission[]>(defaultPermissions);
  const [currentUser, setCurrentUser] = useState<UserWithRoles | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  useEffect(() => {
    const loadUserPermissions = async () => {
      setIsLoadingPermissions(true);

      if (!authState.user) {
        setCurrentUser(null);
        setPermissions([]);
        setIsLoading(false);
        setIsLoadingPermissions(false);
        return;
      }

      try {
        // Get user's permissions based on role
        const userPermissions = getRolePermissions(
          authState.user.role as UserRole,
          authState.user.teamRole
        );

        // Get user's role definition
        const roleDefinition = getUserRoleDefinition(
          authState.user.role as UserRole,
          authState.user.teamRole
        );

        setPermissions(userPermissions);

        // Create user with roles
        const userWithRoles: UserWithRoles = {
          ...authState.user,
          id: authState.user.id || 'current-user',
          roles: [roleDefinition],
          isActive: true,
          lastLogin: new Date(),
          createdBy: 'system',
          assignedBranches: ['all']
        };

        setCurrentUser(userWithRoles);

        console.log('RBAC: Loaded user with roles', {
          user: userWithRoles,
          permissions: userPermissions
        });
      } catch (error) {
        console.error('Error loading user permissions:', error);
        // Fallback to minimal permissions if there's an error
        setPermissions(['dashboard.view']);
      } finally {
        setIsLoading(false);
        setIsLoadingPermissions(false);
      }
    };

    loadUserPermissions();
  }, [authState.user]);

  // Helper functions for role checks
  const isStaff = (): boolean => {
    return currentUser?.role === 'team' && currentUser?.teamRole === 'staff';
  };

  const isManager = (): boolean => {
    return currentUser?.role === 'team' && currentUser?.teamRole === 'manager';
  };

  const isTrainer = (): boolean => {
    return currentUser?.role === 'team' && currentUser?.teamRole === 'trainer';
  };

  const canAccessResource = (resource: string, action: string): boolean => {
    if (currentUser?.role === 'super-admin') return true;
    return permissions.includes(`${action}:${resource}` as Permission);
  };

  const canAccessBranch = (branchId: string): boolean => {
    if (currentUser?.role === 'super-admin') return true;
    return currentUser?.assignedBranches?.includes('all') || 
           currentUser?.assignedBranches?.includes(branchId) ||
           false;
  };

  const getCurrentBranchId = (): string | null => {
    return currentUser?.branchId || null;
  };

  const contextValue: RBACContextType = {
    currentUser,
    isLoading: isLoading || authState.isLoading,
    isLoadingPermissions: isLoadingPermissions || authState.isLoading,
    hasPermission: (requiredPermission: Permission) => {
      // Super admin has all permissions
      if (currentUser?.role === 'super-admin') return true;
      return permissions.includes(requiredPermission);
    },
    hasAnyPermission: (requiredPermissions: Permission[]) => {
      if (currentUser?.role === 'super-admin') return true;
      return requiredPermissions.some(permission => permissions.includes(permission));
    },
    hasAllPermissions: (requiredPermissions: Permission[]) => {
      if (currentUser?.role === 'super-admin') return true;
      return requiredPermissions.every(permission => permissions.includes(permission));
    },
    getUserPermissions: () => permissions,
    getUserRole: () => currentUser?.role || null,
    isInRole: (role: UserRole) => currentUser?.role === role,
    isInAnyRole: (roles: UserRole[]) =>
      roles.some(role => currentUser?.role === role),
    canAccessResource,
    canAccessBranch,
    getCurrentBranchId,
    isTrainer,
    isStaff,
    isManager,
    logActivity: (action: string, details: Record<string, unknown>) => {
      const resource = (details.resource as string) || 'system';
      const log: AuditLog = {
        id: `log-${Date.now()}`,
        userId: currentUser?.id || 'anonymous',
        userName: currentUser?.name || 'System',
        action,
        resource,
        resourceId: (details.id as string) || '',
        branchId: currentUser?.branchId || 'none',
        details,
        ipAddress: '0.0.0.0',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        timestamp: new Date()
      };
      setAuditLogs(prev => [log, ...prev].slice(0, 1000));
    },
    getAuditLogs: () => auditLogs,
    getRoles: () => Object.values(mockRoles),
  };

  return (
    <RBACContext.Provider value={contextValue}>
      {!isLoading && children}
    </RBACContext.Provider>
  );
};

// Export roles and users for admin management
export { mockRoles, mockUsersWithRoles };
