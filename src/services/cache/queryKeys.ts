/**
 * Query Keys Factory
 * Centralized query key management for React Query
 * Ensures consistent cache invalidation across the app
 */

export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },

  // Members
  members: {
    all: ['members'] as const,
    lists: () => [...queryKeys.members.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.members.lists(), filters] as const,
    details: () => [...queryKeys.members.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.members.details(), id] as const,
    stats: (id: string) => [...queryKeys.members.detail(id), 'stats'] as const,
    attendance: (id: string) => [...queryKeys.members.detail(id), 'attendance'] as const,
    subscriptions: (id: string) => [...queryKeys.members.detail(id), 'subscriptions'] as const,
  },

  // Gyms
  gyms: {
    all: ['gyms'] as const,
    lists: () => [...queryKeys.gyms.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.gyms.lists(), filters] as const,
    details: () => [...queryKeys.gyms.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.gyms.details(), id] as const,
    stats: () => [...queryKeys.gyms.all, 'stats'] as const,
    usage: () => [...queryKeys.gyms.all, 'usage'] as const,
    analytics: (id: string) => [...queryKeys.gyms.detail(id), 'analytics'] as const,
  },

  // Branches
  branches: {
    all: ['branches'] as const,
    lists: () => [...queryKeys.branches.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.branches.lists(), filters] as const,
    details: () => [...queryKeys.branches.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.branches.details(), id] as const,
    stats: (id: string) => [...queryKeys.branches.detail(id), 'stats'] as const,
  },

  // Subscriptions
  subscriptions: {
    all: ['subscriptions'] as const,
    lists: () => [...queryKeys.subscriptions.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.subscriptions.lists(), filters] as const,
    details: () => [...queryKeys.subscriptions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.subscriptions.details(), id] as const,
  },

  // Products
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },

  // Attendance
  attendance: {
    all: ['attendance'] as const,
    lists: () => [...queryKeys.attendance.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.attendance.lists(), filters] as const,
    summary: (memberId: string) => [...queryKeys.attendance.all, 'summary', memberId] as const,
  },

  // Assignments
  assignments: {
    all: ['assignments'] as const,
    lists: () => [...queryKeys.assignments.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.assignments.lists(), filters] as const,
    details: () => [...queryKeys.assignments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.assignments.details(), id] as const,
  },

  // Announcements
  announcements: {
    all: ['announcements'] as const,
    lists: () => [...queryKeys.announcements.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.announcements.lists(), filters] as const,
    details: () => [...queryKeys.announcements.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.announcements.details(), id] as const,
  },

  // Equipment
  equipment: {
    all: ['equipment'] as const,
    lists: () => [...queryKeys.equipment.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.equipment.lists(), filters] as const,
    details: () => [...queryKeys.equipment.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.equipment.details(), id] as const,
  },

  // Invoices
  invoices: {
    all: ['invoices'] as const,
    lists: () => [...queryKeys.invoices.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.invoices.lists(), filters] as const,
    details: () => [...queryKeys.invoices.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.invoices.details(), id] as const,
    recent: (gymId?: string) => [...queryKeys.invoices.all, 'recent', gymId] as const,
  },

  // Transactions
  transactions: {
    all: ['transactions'] as const,
    lists: () => [...queryKeys.transactions.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.transactions.lists(), filters] as const,
  },

  // Analytics
  analytics: {
    all: ['analytics'] as const,
    dashboard: (filters?: Record<string, any>) => [...queryKeys.analytics.all, 'dashboard', filters] as const,
    revenue: (filters?: Record<string, any>) => [...queryKeys.analytics.all, 'revenue', filters] as const,
    memberships: (filters?: Record<string, any>) => [...queryKeys.analytics.all, 'memberships', filters] as const,
    attendance: (filters?: Record<string, any>) => [...queryKeys.analytics.all, 'attendance', filters] as const,
    classes: (filters?: Record<string, any>) => [...queryKeys.analytics.all, 'classes', filters] as const,
  },

  // Diet & Workout
  dietWorkout: {
    all: ['diet-workout'] as const,
    dietPlans: {
      all: ['diet-workout', 'diet-plans'] as const,
      list: (filters?: Record<string, any>) => ['diet-workout', 'diet-plans', 'list', filters] as const,
      detail: (id: string) => ['diet-workout', 'diet-plans', 'detail', id] as const,
    },
    workoutPlans: {
      all: ['diet-workout', 'workout-plans'] as const,
      list: (filters?: Record<string, any>) => ['diet-workout', 'workout-plans', 'list', filters] as const,
      detail: (id: string) => ['diet-workout', 'workout-plans', 'detail', id] as const,
    },
  },

  // Classes
  classes: {
    all: ['classes'] as const,
    lists: () => [...queryKeys.classes.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.classes.lists(), filters] as const,
    details: () => [...queryKeys.classes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.classes.details(), id] as const,
    upcoming: () => [...queryKeys.classes.all, 'upcoming'] as const,
  },

  // Lockers
  lockers: {
    all: ['lockers'] as const,
    lists: () => [...queryKeys.lockers.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.lockers.lists(), filters] as const,
    details: () => [...queryKeys.lockers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.lockers.details(), id] as const,
    sizes: () => [...queryKeys.lockers.all, 'sizes'] as const,
    summary: (branchId?: string) => [...queryKeys.lockers.all, 'summary', branchId] as const,
  },

  // Referrals
  referrals: {
    all: ['referrals'] as const,
    lists: () => [...queryKeys.referrals.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.referrals.lists(), filters] as const,
    stats: () => [...queryKeys.referrals.all, 'stats'] as const,
  },
};
