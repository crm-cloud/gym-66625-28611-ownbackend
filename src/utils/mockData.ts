// Comprehensive mock data exports to replace all deleted mock files
export const mockProgressSummary: any = {};
export const mockMemberGoals: any[] = [];
export const mockFeedback: any[] = [];
export const mockAIInsights: any[] = [];
export const mockDietPlans: any[] = [];
export const mockWorkoutPlans: any[] = [];
export const mockPlanAssignments: any[] = [];
export const mockTransactionCategories: any[] = [];
export const mockPaymentMethods: any[] = [];
export const mockMembershipPlans: any[] = [];
export const mockLockerSizes = [
  { id: 'small', name: 'Small', dimensions: '12" x 12" x 36"', monthlyFee: 20 },
  { id: 'medium', name: 'Medium', dimensions: '18" x 18" x 36"', monthlyFee: 30 },
  { id: 'large', name: 'Large', dimensions: '24" x 24" x 36"', monthlyFee: 40 },
  { id: 'xlarge', name: 'Extra Large', dimensions: '36" x 24" x 36"', monthlyFee: 50 },
];

export const mockLockers = [
  {
    id: 'L-101',
    number: '101',
    name: 'Locker 101',
    status: 'available',
    size: mockLockerSizes[0],
    branchId: '1',
    branchName: 'Downtown Branch',
    monthlyFee: 20,
    notes: '',
    assignedMemberId: undefined,
    assignedMemberName: undefined,
    assignedDate: undefined,
    expirationDate: undefined,
    releaseDate: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'L-102',
    number: '102',
    name: 'Locker 102',
    status: 'occupied',
    size: mockLockerSizes[1],
    branchId: '1',
    branchName: 'Downtown Branch',
    monthlyFee: 30,
    assignedMemberId: 'M1001',
    assignedMemberName: 'John Doe',
    assignedDate: '2025-01-01',
    expirationDate: '2025-12-31',
    notes: 'Key card access only',
    releaseDate: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-10T00:00:00Z',
  },
  {
    id: 'L-201',
    number: '201',
    name: 'Locker 201',
    status: 'maintenance',
    size: mockLockerSizes[2],
    branchId: '2',
    branchName: 'Westside Branch',
    monthlyFee: 40,
    notes: 'Lock needs replacement',
    assignedMemberId: undefined,
    assignedMemberName: undefined,
    assignedDate: undefined,
    expirationDate: undefined,
    releaseDate: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-20T00:00:00Z',
  },
  {
    id: 'L-202',
    number: '202',
    name: 'Locker 202',
    status: 'reserved',
    size: mockLockerSizes[1],
    branchId: '2',
    branchName: 'Westside Branch',
    monthlyFee: 30,
    assignedMemberId: 'M1002',
    assignedMemberName: 'Jane Smith',
    assignedDate: '2025-02-01',
    expirationDate: '2025-07-31',
    notes: 'Prepaid for 6 months',
    releaseDate: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'L-301',
    number: '301',
    name: 'Locker 301',
    status: 'available',
    size: mockLockerSizes[0],
    branchId: '3',
    branchName: 'Northside Branch',
    monthlyFee: 20,
    notes: '',
    assignedMemberId: undefined,
    assignedMemberName: undefined,
    assignedDate: undefined,
    expirationDate: undefined,
    releaseDate: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z',
  },
];
export const mockMeasurementHistory: any[] = [];
export const mockAttendanceRecords: any[] = [];
export const mockProducts: any[] = [];
export const mockTeamMembers: any[] = [];
export const mockTrainerAssignments: any[] = [];
export const mockTrainerUtilization: any[] = [];
export const mockLeads: any[] = [];
export const mockTransactions: any[] = [];
export const mockMonthlyData: any[] = [];
export const mockEnhancedTrainers: any[] = [];
export const mockClasses: any[] = [];
// Temporary mockInvoices for backward compatibility - other components will be updated later
export const mockInvoices: any[] = [];
export const mockBranches: any[] = [];
export const mockTrainers: any[] = [];
export const mockTeamRoles: any[] = [];
export const mockPermissions: any[] = [];
export const mockMembershipData: any = {};
export const mockBillingHistory: any[] = [];
export const mockBenefits: any[] = [];
export const mockMembers: any[] = [];
export const mockCategories: any[] = [];
export const accessTypeLabels: any = {};
export const feedbackCategories: any[] = [];
export const leadSources: any[] = [];
export const lockerStatuses: any[] = [];
export const classTagLabels: any = {};

// Mock attendance data
export const mockAttendanceSummary = {
  totalRecords: 150,
  totalMembers: 100,
  totalStaff: 20,
  checkedInCount: 120,
  checkedOutCount: 30,
  lateArrivals: 25,
  noShows: 5,
  averageDuration: 120, // minutes
  peakHours: [
    { hour: 8, count: 45 },
    { hour: 9, count: 60 },
    { hour: 10, count: 50 },
    { hour: 17, count: 55 },
    { hour: 18, count: 40 }
  ],
  busyDays: [
    { day: 'Monday', count: 35 },
    { day: 'Tuesday', count: 40 },
    { day: 'Wednesday', count: 38 },
    { day: 'Thursday', count: 42 },
    { day: 'Friday', count: 30 },
    { day: 'Saturday', count: 25 },
    { day: 'Sunday', count: 10 }
  ],
  methodBreakdown: {
    biometric: 100,
    manual: 30,
    card: 15,
    mobile: 5
  },
  branchBreakdown: [
    { branchId: 'branch-001', branchName: 'Downtown Branch', count: 70 },
    { branchId: 'branch-002', branchName: 'Westside Branch', count: 50 },
    { branchId: 'branch-003', branchName: 'Northside Branch', count: 30 }
  ]
};

export const mockAttendanceData: any[] = [];

// Add missing exports to mockData
export const mockMembershipAssignments: any[] = [];
export const mockOrders: any[] = [];
export const mockClassEnrollments: any[] = [];
export const mockMemberships: any[] = [];
export const mockPaymentHistory: any[] = [];
export const mockFinanceCategories: any[] = [];
export const mockFinancialSummary = {
  totalIncome: 125000,
  totalExpenses: 75000,
  netProfit: 50000,
  monthlyIncome: 10416.67,
  monthlyExpenses: 6250,
  monthlyProfit: 4166.67,
  outstandingPayments: 12000,
  totalMembers: 150,
  activeMembers: 120,
  monthlyRevenueGrowth: 12.5,
  expenseBreakdown: {
    rent: 20000,
    salaries: 35000,
    utilities: 5000,
    equipment: 10000,
    other: 5000
  },
  revenueByCategory: {
    memberships: 80000,
    personalTraining: 30000,
    merchandise: 10000,
    other: 5000
  },
  monthlyData: Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
    income: Math.floor(Math.random() * 15000) + 5000,
    expenses: Math.floor(Math.random() * 10000) + 2000,
  }))
};

export const generateMockAttendanceRecords = (count: number) => [];

// Team Member types and utilities
export enum TeamMemberRole {
  ADMIN = 'admin',
  MANAGER = 'manager', 
  TRAINER = 'trainer',
  STAFF = 'staff'
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: TeamMemberRole;
  department?: string;
  status: 'active' | 'inactive';
  avatar?: string;
  branchName: string;
  branchId: string;
  createdAt: Date;
  lastLogin?: Date;
}

export const getTeamMemberByEmail = (email: string): TeamMember | undefined => {
  return mockTeamMembers.find(member => member.email === email);
};

export const enhancedTrainers = mockEnhancedTrainers;

// Export enums and types
export enum FeedbackType {
  GENERAL = 'general',
  TRAINER = 'trainer',
  EQUIPMENT = 'equipment',
  FACILITY = 'facility',
  CLASS = 'class'
}

export enum FeedbackStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum FeedbackPriority {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  CONVERTED = 'converted',
  LOST = 'lost'
}

export enum LeadSource {
  WEBSITE = 'website',
  REFERRAL = 'referral',
  SOCIAL_MEDIA = 'social-media',
  WALK_IN = 'walk-in',
  ADVERTISEMENT = 'advertisement'
}

export enum LeadPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum LockerStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  OUT_OF_ORDER = 'out-of-order'
}

export interface LockerSize {
  id: string;
  name: string;
  dimensions: string;
  monthlyFee: number;
}

// Add missing mock exports
export const mockFeedbackStats: any = {};
export const mockLeadStats: any = {};
export const mockLockerSummary = {
  totalLockers: mockLockers.length,
  available: mockLockers.filter(l => l.status === 'available').length,
  occupied: mockLockers.filter(l => l.status === 'occupied').length,
  reserved: mockLockers.filter(l => l.status === 'reserved').length,
  maintenance: mockLockers.filter(l => l.status === 'maintenance').length,
  sizeBreakdown: mockLockerSizes.map(size => ({
    size: size.name,
    count: mockLockers.filter(l => l.size?.id === size.id).length
  })),
  branchBreakdown: [
    { branchId: '1', branchName: 'Downtown Branch', count: mockLockers.filter(l => l.branchId === '1').length },
    { branchId: '2', branchName: 'Westside Branch', count: mockLockers.filter(l => l.branchId === '2').length },
    { branchId: '3', branchName: 'Northside Branch', count: mockLockers.filter(l => l.branchId === '3').length },
  ]
};
export const mockLockerAssignments: any[] = [];
export const mockPayments: any[] = [];

// Add more exports as needed for remaining components
export const placeholderData = 'Replace with actual database queries';