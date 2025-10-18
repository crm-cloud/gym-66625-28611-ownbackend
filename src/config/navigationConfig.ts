import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  UserCog,
  Shield, 
  Building, 
  Calendar, 
  Dumbbell, 
  CreditCard, 
  DollarSign, 
  BarChart3, 
  UserCheck, 
  Briefcase, 
  ClipboardList, 
  MessageSquare, 
  ShoppingBag, 
  Package, 
  Settings, 
  FileText, 
  Activity, 
  MapPin, 
  Clock, 
  PieChart, 
  TrendingUp,
  CheckSquare,
  ShoppingCart,
  Car,
  Wrench,
  HelpCircle,
  Gift,
  Target,
  Mail,
  Smartphone,
  Database,
  Monitor,
  LifeBuoy,
  BrainCircuit,
  Megaphone,
  Share2
} from 'lucide-react';
import { UserRole } from '@/types/auth';
import { Permission } from '@/types/rbac';

export interface NavigationItem {
  id: string;
  title: string;
  url: string;
  icon: any;
  group: string;
  // Role-based access control
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  teamRole?: string;
  memberOnly?: boolean;
  // UI behavior
  exactMatch?: boolean;
  badge?: string;
  disabled?: boolean;
}

export interface NavigationGroup {
  id: string;
  title: string;
  items: NavigationItem[];
  // Group-level access control
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  teamRole?: string;
  priority?: number;
}

// Centralized navigation configuration with complete RBAC metadata
export const navigationConfig: NavigationGroup[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    priority: 1,
    items: [
      {
        id: 'dashboard-main',
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
        group: 'dashboard',
        exactMatch: true,
      }
    ]
  },
  {
    id: 'team-management',
    title: 'Team Management',
    allowedRoles: ['admin', 'super-admin'],
    requiredPermissions: ['team.view'],
    priority: 2,
    items: [
      {
        id: 'team',
        title: 'Team',
        url: '/team',
        icon: Briefcase,
        group: 'team-management',
        requiredPermissions: ['team.view'],
      },
      {
        id: 'roles',
        title: 'Roles',
        url: '/roles',
        icon: Shield,
        group: 'team-management',
        allowedRoles: ['super-admin', 'admin'],
        requiredPermissions: ['roles.view'],
      },
      {
        id: 'roles-create',
        title: 'Add Role',
        url: '/roles/create',
        icon: Shield,
        group: 'team-management',
        allowedRoles: ['super-admin', 'admin'],
        requiredPermissions: ['roles.create'],
      }
    ]
  },
  {
    id: 'saas-management',
    title: 'SaaS Management',
    allowedRoles: ['super-admin'],
    priority: 2,
    items: [
      {
        id: 'gym-management',
        title: 'Gym Management',
        url: '/gyms',
        icon: Building,
        group: 'saas-management',
        allowedRoles: ['super-admin'],
      },
      {
        id: 'admin-management',
        title: 'Admin Management',
        url: '/users/admin-management',
        icon: UserCog,
        group: 'saas-management',
        allowedRoles: ['super-admin'],
      },
      {
        id: 'subscription-plans',
        title: 'Subscription Plans',
        url: '/subscription-plans',
        icon: CreditCard,
        group: 'saas-management',
        allowedRoles: ['super-admin'],
      }
    ]
  },
  {
    id: 'platform-analytics',
    title: 'Platform Analytics',
    allowedRoles: ['super-admin'],
    priority: 16,
    items: [
        {
          id: 'platform-analytics',
          title: 'Platform Analytics',
          url: '/platform-analytics',
          icon: BarChart3,
          group: 'platform-analytics',
          allowedRoles: ['super-admin'],
          requiredPermissions: ['analytics.view'],
        },
        {
          id: 'platform-reports',
          title: 'Platform Reports',
          url: '/platform-reports',
          icon: FileText,
          group: 'platform-analytics',
          allowedRoles: ['super-admin'],
          requiredPermissions: ['reports.view'],
        }
    ]
  },
  {
    id: 'gym-overview',
    title: 'Gym Overview',
    allowedRoles: ['admin'],
    priority: 4,
    items: [
      {
        id: 'gym-dashboard',
        title: 'Gym Dashboard',
        url: '/gyms/dashboard',
        icon: Building,
        group: 'gym-overview',
        allowedRoles: ['admin'],
      },
      {
        id: 'admin-branches',
        title: 'All Branches',
        url: '/branches',
        icon: MapPin,
        group: 'gym-overview',
        allowedRoles: ['admin'],
        requiredPermissions: ['branches.view'],
      }
    ]
  },
  {
    id: 'branch-management',
    title: 'Branch Management',
    allowedRoles: ['admin', 'team'],
    requiredPermissions: ['branches.view'],
    priority: 5,
    items: [
      {
        id: 'branches',
        title: 'Branches',
        url: '/branches',
        icon: Building,
        group: 'branch-management',
        allowedRoles: ['admin', 'team'],
        teamRole: 'manager',
        requiredPermissions: ['branches.view'],
      },
      {
        id: 'branches-create',
        title: 'Add Branch',
        url: '/branches/create',
        icon: Building,
        group: 'branch-management',
        allowedRoles: ['admin', 'team'],
        teamRole: 'manager',
        requiredPermissions: ['branches.create'],
      }
    ]
  },
  {
    id: 'members',
    title: 'Member Management',
    allowedRoles: ['admin', 'team'],
    requiredPermissions: ['members.view'],
    priority: 3,
    items: [
      {
        id: 'members-list',
        title: 'Members',
        url: '/members',
        icon: Users,
        group: 'members',
        requiredPermissions: ['members.view'],
      },
      {
        id: 'members-create',
        title: 'Add Member',
        url: '/members/create',
        icon: UserPlus,
        group: 'members',
        requiredPermissions: ['members.create'],
      },
    ]
  },
  {
    id: 'membership',
    title: 'Membership',
    allowedRoles: ['admin', 'team'],
    priority: 4,
    items: [
      {
        id: 'membership-plans',
        title: 'Plans',
        url: '/membership/plans',
        icon: ClipboardList,
        group: 'membership',
        requiredPermissions: ['members.view'],
      },
      {
        id: 'membership-add',
        title: 'Add Membership',
        url: '/membership/add',
        icon: CreditCard,
        group: 'membership',
        requiredPermissions: ['members.edit'],
      }
    ]
  },
  {
    id: 'classes',
    title: 'Classes & Training',
    allowedRoles: ['admin', 'team'],
    priority: 5,
    items: [
      {
        id: 'classes-list',
        title: 'Classes',
        url: '/classes',
        icon: Calendar,
        group: 'classes',
        requiredPermissions: ['classes.view'],
      },
      {
        id: 'classes-create',
        title: 'Create Class',
        url: '/classes/create',
        icon: Calendar,
        group: 'classes',
        allowedRoles: ['admin', 'team'],
        teamRole: 'trainer',
        requiredPermissions: ['classes.create'],
      },
      {
        id: 'trainers',
        title: 'Trainers',
        url: '/trainers',
        icon: Dumbbell,
        group: 'classes',
        allowedRoles: ['admin', 'team'],
        requiredPermissions: ['team.view'],
      },
      {
        id: 'diet-workout',
        title: 'Diet & Workout',
        url: '/diet-workout',
        icon: Dumbbell,
        group: 'classes',
      }
    ]
  },
  {
    id: 'communication',
    title: 'Communication',
    allowedRoles: ['admin', 'team'],
    requiredPermissions: ['notifications.view'],
    priority: 6,
    items: [
      {
        id: 'announcements',
        title: 'Announcements',
        url: '/announcements',
        icon: Megaphone,
        group: 'communication',
        requiredPermissions: ['notifications.view'],
      }
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing',
    allowedRoles: ['admin', 'team'],
    priority: 7,
    items: [
      {
        id: 'leads',
        title: 'Leads',
        url: '/leads',
        icon: UserCheck,
        group: 'marketing',
        requiredPermissions: ['leads.view'],
      },
      {
        id: 'referrals',
        title: 'Referrals',
        url: '/referrals',
        icon: Share2,
        group: 'marketing',
        requiredPermissions: ['referrals.view'],
      }
    ]
  },
  {
    id: 'finance',
    title: 'Finance',
    allowedRoles: ['admin', 'team'],
    requiredPermissions: ['finance.view'],
    priority: 8,
    items: [
      {
        id: 'finance-dashboard',
        title: 'Finance',
        url: '/finance',
        icon: DollarSign,
        group: 'finance',
        requiredPermissions: ['finance.view'],
      },
      {
        id: 'transactions',
        title: 'Transactions',
        url: '/finance/transactions',
        icon: ClipboardList,
        group: 'finance',
        requiredPermissions: ['finance.view'],
      },
      {
        id: 'invoices',
        title: 'Invoices',
        url: '/finance/invoices',
        icon: FileText,
        group: 'finance',
        requiredPermissions: ['finance.view'],
      },
      {
        id: 'reports',
        title: 'Reports',
        url: '/finance/reports',
        icon: BarChart3,
        group: 'finance',
        requiredPermissions: ['reports.view'],
      }
    ]
  },
  {
    id: 'operations',
    title: 'Operations',
    allowedRoles: ['admin', 'team'],
    priority: 9,
    items: [
      {
        id: 'attendance',
        title: 'Attendance',
        url: '/attendance',
        icon: UserCheck,
        group: 'operations',
        requiredPermissions: ['attendance.view'],
      },
      {
        id: 'attendance-devices',
        title: 'Devices',
        url: '/attendance/devices',
        icon: Monitor,
        group: 'operations',
        allowedRoles: ['admin'],
        requiredPermissions: ['devices.view'],
      },
      {
        id: 'lockers',
        title: 'Lockers',
        url: '/lockers',
        icon: Package,
        group: 'operations',
        requiredPermissions: ['lockers.view'],
      },
      {
        id: 'equipment',
        title: 'Equipment',
        url: '/equipment',
        icon: Wrench,
        group: 'operations',
        requiredPermissions: ['equipment.view'],
      }
    ]
  },
  {
    id: 'store',
    title: 'Store & POS',
    allowedRoles: ['admin', 'team'],
    priority: 10,
    items: [
      {
        id: 'store',
        title: 'Store',
        url: '/store',
        icon: ShoppingBag,
        group: 'store',
        memberOnly: true,
      },
      {
        id: 'products',
        title: 'Products',
        url: '/products',
        icon: Package,
        group: 'store',
        requiredPermissions: ['products.view'],
      }
    ]
  },
  {
    id: 'support',
    title: 'Support',
    priority: 11,
    items: [
      {
        id: 'feedback',
        title: 'Feedback',
        url: '/feedback',
        icon: MessageSquare,
        group: 'support',
        requiredPermissions: ['feedback.view'],
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Branch Analytics',
    allowedRoles: ['admin'],
    requiredPermissions: ['analytics.view'],
    priority: 12,
    items: [
      {
        id: 'branch-analytics',
        title: 'Branch Analytics',
        url: '/analytics',
        icon: BarChart3,
        group: 'analytics',
        allowedRoles: ['admin'],
        requiredPermissions: ['analytics.view'],
      },
      {
        id: 'branch-reports',
        title: 'Branch Reports',
        url: '/reports',
        icon: FileText,
        group: 'analytics',
        allowedRoles: ['admin'],
        requiredPermissions: ['reports.view'],
      }
    ]
  },
  {
    id: 'communication-settings',
    title: 'Communication Settings',
    allowedRoles: ['admin'],
    priority: 13,
    items: [
      {
        id: 'email-settings',
        title: 'Email Settings',
        url: '/system/email',
        icon: Mail,
        group: 'communication-settings',
        allowedRoles: ['admin'],
        requiredPermissions: ['system.manage'],
      },
      {
        id: 'sms-settings',
        title: 'SMS Settings',
        url: '/system/sms',
        icon: Smartphone,
        group: 'communication-settings',
        allowedRoles: ['admin'],
        requiredPermissions: ['system.manage'],
      },
      {
        id: 'whatsapp-settings',
        title: 'WhatsApp Settings',
        url: '/system/whatsapp',
        icon: MessageSquare,
        group: 'communication-settings',
        allowedRoles: ['admin'],
        requiredPermissions: ['system.manage'],
      },
      {
        id: 'payment-gateway-settings',
        title: 'Payment Gateway',
        url: '/system/payment-gateway',
        icon: CreditCard,
        group: 'communication-settings',
        allowedRoles: ['admin'],
        requiredPermissions: ['system.manage'],
      },
      {
        id: 'ai-settings',
        title: 'AI Settings',
        url: '/system/ai-settings',
        icon: BrainCircuit,
        group: 'communication-settings',
        allowedRoles: ['admin'],
        requiredPermissions: ['system.manage'],
      }
    ]
  },
  {
    id: 'platform-settings',
    title: 'Platform Settings',
    allowedRoles: ['super-admin'],
    priority: 17,
    items: [
      {
        id: 'system-settings',
        title: 'Global Settings',
        url: '/system/settings',
        icon: Settings,
        group: 'platform-settings',
        allowedRoles: ['super-admin'],
        requiredPermissions: ['system.manage'],
      },
      {
        id: 'email-settings-global',
        title: 'Email Settings (Global)',
        url: '/system/email',
        icon: Mail,
        group: 'platform-settings',
        allowedRoles: ['super-admin'],
      },
      {
        id: 'sms-settings-global',
        title: 'SMS Settings (Global)',
        url: '/system/sms',
        icon: Smartphone,
        group: 'platform-settings',
        allowedRoles: ['super-admin'],
      },
      {
        id: 'system-health',
        title: 'System Health',
        url: '/system/health',
        icon: Activity,
        group: 'platform-settings',
        allowedRoles: ['super-admin'],
        requiredPermissions: ['system.view'],
      },
      {
        id: 'system-backup',
        title: 'Backup & Restore',
        url: '/system/backup',
        icon: Database,
        group: 'platform-settings',
        allowedRoles: ['super-admin'],
        requiredPermissions: ['system.backup'],
      }
    ]
  },
  // Member-specific navigation
  {
    id: 'member-fitness',
    title: 'Fitness',
    allowedRoles: ['member'],
    priority: 1,
    items: [
      {
        id: 'member-classes',
        title: 'My Classes',
        url: '/member/classes',
        icon: Calendar,
        group: 'member',
        memberOnly: true,
      },
      {
        id: 'member-checkins',
        title: 'Check-ins',
        url: '/member/checkins',
        icon: UserCheck,
        group: 'member',
        memberOnly: true,
      },
      {
        id: 'member-goals',
        title: 'My Goals',
        url: '/member/goals',
        icon: Target,
        group: 'member',
        memberOnly: true,
      },
      {
        id: 'member-trainer-request',
        title: 'Trainer Request',
        url: '/member/trainer-request',
        icon: Dumbbell,
        group: 'member',
        memberOnly: true,
      },
      {
        id: 'member-progress',
        title: 'My Progress',
        url: '/member/progress',
        icon: TrendingUp,
        group: 'member',
        memberOnly: true,
      },
      {
        id: 'member-diet-workout',
        title: 'Diet & Workout',
        url: '/member/diet-workout',
        icon: Dumbbell,
        group: 'member',
        memberOnly: true,
      }
    ]
  },
  {
    id: 'member-account',
    title: 'Account',
    allowedRoles: ['member'],
    priority: 2,
    items: [
      {
        id: 'member-store',
        title: 'Store',
        url: '/store',
        icon: ShoppingCart,
        group: 'member',
        memberOnly: true,
      },
      {
        id: 'member-billing',
        title: 'Billing & Payments',
        url: '/member/billing',
        icon: CreditCard,
        group: 'member',
        memberOnly: true,
      },
      {
        id: 'member-feedback',
        title: 'Feedback',
        url: '/member/feedback',
        icon: MessageSquare,
        group: 'member',
        memberOnly: true,
      },
      {
        id: 'member-referrals',
        title: 'Referrals',
        url: '/member/referrals',
        icon: Gift,
        group: 'member',
        memberOnly: true,
      },
      {
        id: 'member-announcements',
        title: 'Announcements',
        url: '/member/announcements',
        icon: Megaphone,
        group: 'member',
        memberOnly: true,
      }
    ]
  },
  {
    id: 'member-support',
    title: 'Support',
    allowedRoles: ['member'],
    priority: 3,
    items: [
      {
        id: 'member-help',
        title: 'Help Center',
        url: '/member/help',
        icon: HelpCircle,
        group: 'member',
        memberOnly: true,
      }
    ]
  },
  // Manager-specific navigation
  {
    id: 'manager-operations',
    title: 'Management',
    teamRole: 'manager',
    priority: 1,
    items: [
      {
        id: 'manager-dashboard',
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
        group: 'manager',
        teamRole: 'manager',
      },
      {
        id: 'manager-team',
        title: 'Team',
        url: '/team',
        icon: Briefcase,
        group: 'manager',
        teamRole: 'manager',
        requiredPermissions: ['team.view'],
      },
      {
        id: 'manager-analytics',
        title: 'Analytics',
        url: '/analytics',
        icon: BarChart3,
        group: 'manager',
        teamRole: 'manager',
        requiredPermissions: ['analytics.view'],
      }
    ]
  },
  {
    id: 'branch-management-manager',
    title: 'Branch Management',
    teamRole: 'manager',
    requiredPermissions: ['branches.view'],
    priority: 2,
    items: [
      {
        id: 'branches-manager',
        title: 'Branches',
        url: '/branches',
        icon: Building,
        group: 'branch-management',
        teamRole: 'manager',
        requiredPermissions: ['branches.view'],
      },
      {
        id: 'branches-create-manager',
        title: 'Add Branch',
        url: '/branches/create',
        icon: Building,
        group: 'branch-management',
        teamRole: 'manager',
        requiredPermissions: ['branches.create'],
      }
    ]
  },
  {
    id: 'members-manager',
    title: 'Member Management',
    teamRole: 'manager',
    requiredPermissions: ['members.view'],
    priority: 3,
    items: [
      {
        id: 'members-list-manager',
        title: 'Members',
        url: '/members',
        icon: Users,
        group: 'members',
        teamRole: 'manager',
        requiredPermissions: ['members.view'],
      },
      {
        id: 'members-create-manager',
        title: 'Add Member',
        url: '/members/create',
        icon: UserPlus,
        group: 'members',
        teamRole: 'manager',
        requiredPermissions: ['members.create'],
      }
    ]
  },
  {
    id: 'membership-manager',
    title: 'Membership',
    teamRole: 'manager',
    priority: 4,
    items: [
      {
        id: 'membership-plans-manager',
        title: 'Plans',
        url: '/membership/plans',
        icon: ClipboardList,
        group: 'membership',
        teamRole: 'manager',
        requiredPermissions: ['members.view'],
      },
      {
        id: 'membership-add-manager',
        title: 'Add Membership',
        url: '/membership/add',
        icon: CreditCard,
        group: 'membership',
        teamRole: 'manager',
        requiredPermissions: ['members.edit'],
      }
    ]
  },
  {
    id: 'classes-manager',
    title: 'Classes & Training',
    teamRole: 'manager',
    priority: 5,
    items: [
      {
        id: 'classes-list-manager',
        title: 'Classes',
        url: '/classes',
        icon: Calendar,
        group: 'classes',
        teamRole: 'manager',
        requiredPermissions: ['classes.view'],
      },
      {
        id: 'classes-create-manager',
        title: 'Create Class',
        url: '/classes/create',
        icon: Calendar,
        group: 'classes',
        teamRole: 'manager',
        requiredPermissions: ['classes.create'],
      },
      {
        id: 'trainers-manager',
        title: 'Trainers',
        url: '/trainers',
        icon: Dumbbell,
        group: 'classes',
        teamRole: 'manager',
        requiredPermissions: ['team.view'],
      },
      {
        id: 'diet-workout-manager',
        title: 'Diet & Workout',
        url: '/diet-workout',
        icon: Dumbbell,
        group: 'classes',
        teamRole: 'manager',
      }
    ]
  },
  {
    id: 'communication-manager',
    title: 'Communication',
    teamRole: 'manager',
    requiredPermissions: ['notifications.view'],
    priority: 6,
    items: [
      {
        id: 'announcements-manager',
        title: 'Announcements',
        url: '/announcements',
        icon: Megaphone,
        group: 'communication',
        teamRole: 'manager',
        requiredPermissions: ['notifications.view'],
      }
    ]
  },
  {
    id: 'marketing-manager',
    title: 'Marketing',
    teamRole: 'manager',
    priority: 7,
    items: [
      {
        id: 'leads-manager',
        title: 'Leads',
        url: '/leads',
        icon: UserCheck,
        group: 'marketing',
        teamRole: 'manager',
        requiredPermissions: ['leads.view'],
      },
      {
        id: 'referrals-manager',
        title: 'Referrals',
        url: '/referrals',
        icon: Share2,
        group: 'marketing',
        teamRole: 'manager',
        requiredPermissions: ['referrals.view'],
      }
    ]
  },
  {
    id: 'operations-manager',
    title: 'Operations',
    teamRole: 'manager',
    priority: 8,
    items: [
      {
        id: 'attendance-manager',
        title: 'Attendance',
        url: '/attendance',
        icon: UserCheck,
        group: 'operations',
        teamRole: 'manager',
        requiredPermissions: ['attendance.view'],
      },
      {
        id: 'lockers-manager',
        title: 'Lockers',
        url: '/lockers',
        icon: Package,
        group: 'operations',
        teamRole: 'manager',
        requiredPermissions: ['lockers.view'],
      },
      {
        id: 'equipment-manager',
        title: 'Equipment',
        url: '/equipment',
        icon: Wrench,
        group: 'operations',
        teamRole: 'manager',
        requiredPermissions: ['equipment.view'],
      }
    ]
  },
  {
    id: 'store-manager',
    title: 'Store & POS',
    teamRole: 'manager',
    priority: 9,
    items: [
      {
        id: 'products-manager',
        title: 'Products',
        url: '/products',
        icon: Package,
        group: 'store',
        teamRole: 'manager',
        requiredPermissions: ['products.view'],
      }
    ]
  },
  {
    id: 'feedback-manager',
    title: 'Feedback',
    teamRole: 'manager',
    priority: 10,
    items: [
      {
        id: 'feedback-manager',
        title: 'Feedback',
        url: '/feedback',
        icon: MessageSquare,
        group: 'feedback',
        teamRole: 'manager',
        requiredPermissions: ['feedback.view'],
      }
    ]
  },
  // Trainer-specific navigation
  {
    id: 'trainer-dashboard',
    title: 'Trainer Dashboard',
    teamRole: 'trainer',
    priority: 1,
    items: [
      {
        id: 'trainer-schedule',
        title: 'Schedule',
        url: '/trainer/schedule',
        icon: Calendar,
        group: 'trainer',
        teamRole: 'trainer',
      },
      {
        id: 'trainer-attendance',
        title: 'My Attendance',
        url: '/trainer/attendance',
        icon: Clock,
        group: 'trainer',
        teamRole: 'trainer',
      },
      {
        id: 'trainer-clients',
        title: 'Clients',
        url: '/trainer/clients',
        icon: Users,
        group: 'trainer',
        teamRole: 'trainer',
      },
      {
        id: 'trainer-workouts',
        title: 'Workouts',
        url: '/trainer/workouts',
        icon: Dumbbell,
        group: 'trainer',
        teamRole: 'trainer',
      },
      {
        id: 'trainer-progress',
        title: 'Progress',
        url: '/trainer/progress',
        icon: TrendingUp,
        group: 'trainer',
        teamRole: 'trainer',
      },
      {
        id: 'trainer-earnings',
        title: 'Earnings',
        url: '/trainer/earnings',
        icon: DollarSign,
        group: 'trainer',
        teamRole: 'trainer',
      }
    ]
  },
  {
    id: 'classes-trainer',
    title: 'Classes & Training',
    teamRole: 'trainer',
    priority: 2,
    items: [
      {
        id: 'classes-list-trainer',
        title: 'Classes',
        url: '/classes',
        icon: Calendar,
        group: 'classes',
        teamRole: 'trainer',
        requiredPermissions: ['classes.view'],
      },
      {
        id: 'diet-workout-trainer',
        title: 'Diet & Workout',
        url: '/diet-workout',
        icon: Dumbbell,
        group: 'classes',
        teamRole: 'trainer',
      }
    ]
  },
  // Staff-specific navigation
  {
    id: 'staff-operations',
    title: 'Staff Operations',
    teamRole: 'staff',
    priority: 1,
    items: [
      {
        id: 'staff-checkin',
        title: 'Check-in',
        url: '/staff/checkin',
        icon: UserCheck,
        group: 'staff',
        teamRole: 'staff',
      },
      {
        id: 'staff-tasks',
        title: 'Tasks',
        url: '/staff/tasks',
        icon: CheckSquare,
        group: 'staff',
        teamRole: 'staff',
      },
      {
        id: 'staff-maintenance',
        title: 'Maintenance',
        url: '/staff/maintenance',
        icon: Wrench,
        group: 'staff',
        teamRole: 'staff',
      },
      {
        id: 'staff-support',
        title: 'Support',
        url: '/staff/support',
        icon: LifeBuoy,
        group: 'staff',
        teamRole: 'staff',
      }
    ]
  },
  {
    id: 'members-staff',
    title: 'Member Management',
    teamRole: 'staff',
    requiredPermissions: ['members.view'],
    priority: 2,
    items: [
      {
        id: 'members-list-staff',
        title: 'Members',
        url: '/members',
        icon: Users,
        group: 'members',
        teamRole: 'staff',
        requiredPermissions: ['members.view'],
      },
      {
        id: 'members-create-staff',
        title: 'Add Member',
        url: '/members/create',
        icon: UserPlus,
        group: 'members',
        teamRole: 'staff',
        requiredPermissions: ['members.create'],
      }
    ]
  },
  {
    id: 'membership-staff',
    title: 'Membership',
    teamRole: 'staff',
    priority: 3,
    items: [
      {
        id: 'membership-plans-staff',
        title: 'Plans',
        url: '/membership/plans',
        icon: ClipboardList,
        group: 'membership',
        teamRole: 'staff',
        requiredPermissions: ['members.view'],
      },
      {
        id: 'membership-add-staff',
        title: 'Add Membership',
        url: '/membership/add',
        icon: CreditCard,
        group: 'membership',
        teamRole: 'staff',
        requiredPermissions: ['members.edit'],
      }
    ]
  },
  {
    id: 'classes-staff',
    title: 'Classes',
    teamRole: 'staff',
    priority: 4,
    items: [
      {
        id: 'classes-list-staff',
        title: 'Classes',
        url: '/classes',
        icon: Calendar,
        group: 'classes',
        teamRole: 'staff',
        requiredPermissions: ['classes.view'],
      }
    ]
  },
  {
    id: 'operations-staff',
    title: 'Operations',
    teamRole: 'staff',
    priority: 5,
    items: [
      {
        id: 'attendance-staff',
        title: 'Attendance',
        url: '/attendance',
        icon: UserCheck,
        group: 'operations',
        teamRole: 'staff',
        requiredPermissions: ['attendance.view'],
      },
      {
        id: 'lockers-staff',
        title: 'Lockers',
        url: '/lockers',
        icon: Package,
        group: 'operations',
        teamRole: 'staff',
        requiredPermissions: ['lockers.view'],
      }
    ]
  },
  {
    id: 'store-staff',
    title: 'Store & POS',
    teamRole: 'staff',
    priority: 6,
    items: [
      {
        id: 'products-staff',
        title: 'Products',
        url: '/products',
        icon: Package,
        group: 'store',
        teamRole: 'staff',
        requiredPermissions: ['products.view'],
      }
    ]
  },
  {
    id: 'feedback-staff',
    title: 'Feedback',
    teamRole: 'staff',
    priority: 7,
    items: [
      {
        id: 'feedback-staff',
        title: 'Feedback',
        url: '/feedback',
        icon: MessageSquare,
        group: 'feedback',
        teamRole: 'staff',
        requiredPermissions: ['feedback.view'],
      }
    ]
  }
];

// Role-specific default routes
export const roleDefaultRoutes: Record<UserRole, string> = {
  'super-admin': '/dashboard',
  'admin': '/dashboard',
  'manager': '/dashboard',
  'staff': '/dashboard',
  'trainer': '/dashboard',
  'team': '/dashboard', 
  'member': '/dashboard'
};

// Helper functions for navigation filtering
export const getNavigationForUser = (
  userRole: UserRole,
  userPermissions: Permission[],
  teamRole?: string
): NavigationGroup[] => {
  // Debug logging for team roles
  if (userRole === 'team') {
    console.log('[Navigation Config] Team user detected:', {
      userRole,
      teamRole,
      permissionCount: userPermissions.length,
      permissions: userPermissions.slice(0, 10) // Log first 10 permissions
    });
    
    // Safety check: If no permissions loaded, log warning
    if (userPermissions.length === 0) {
      console.warn('[Navigation Config] ⚠️ No permissions loaded for team user!', {
        teamRole,
        note: 'This will result in empty navigation. Check user_roles and role_permissions tables.'
      });
    }
  }
  
  return navigationConfig
    .filter(group => {
      // Check group-level access
      if (group.allowedRoles && !group.allowedRoles.includes(userRole)) {
        return false;
      }
      if (group.requiredPermissions && !group.requiredPermissions.some(p => userPermissions.includes(p))) {
        return false;
      }
      if (group.teamRole && group.teamRole !== teamRole) {
        return false;
      }
      return true;
    })
    .map(group => ({
      ...group,
      items: group.items.filter(item => {
        // Check item-level access
        if (item.allowedRoles && !item.allowedRoles.includes(userRole)) {
          return false;
        }
        if (item.requiredPermissions && !item.requiredPermissions.some(p => userPermissions.includes(p))) {
          return false;
        }
        if (item.teamRole && item.teamRole !== teamRole) {
          return false;
        }
        if (item.memberOnly && userRole !== 'member') {
          return false;
        }
        return true;
      })
    }))
    .filter(group => group.items.length > 0) // Remove empty groups
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
};

export const getDefaultRouteForUser = (userRole: UserRole): string => {
  return roleDefaultRoutes[userRole] || '/dashboard';
};

export const isRouteAccessible = (
  route: string,
  userRole: UserRole,
  userPermissions: Permission[],
  teamRole?: string
): boolean => {
  const allItems = navigationConfig.flatMap(group => group.items);
  const item = allItems.find(item => item.url === route || route.startsWith(item.url));
  
  if (!item) return false;
  
  if (item.allowedRoles && !item.allowedRoles.includes(userRole)) {
    return false;
  }
  if (item.requiredPermissions && !item.requiredPermissions.some(p => userPermissions.includes(p))) {
    return false;
  }
  if (item.teamRole && item.teamRole !== teamRole) {
    return false;
  }
  if (item.memberOnly && userRole !== 'member') {
    return false;
  }
  
  return true;
};