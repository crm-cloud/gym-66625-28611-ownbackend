// Batch replacement script for all remaining mock imports

// Replace all remaining mock imports with utils/mockData imports
export const replacements = [
  // Finance
  { from: 'import { mockTransactions, mockMonthlyData } from \'@/mock/finance\';', to: 'import { mockTransactions, mockMonthlyData } from \'@/utils/mockData\';' },
  
  // Members
  { from: 'import { mockMembers } from \'@/mock/members\';', to: 'import { useMembers } from \'@/hooks/useMembers\';' },
  
  // Classes
  { from: 'import { mockClasses, classTagLabels } from \'@/mock/classes\';', to: 'import { useGymClasses } from \'@/hooks/useClasses\';' },
  
  // Feedback
  { from: 'import { mockFeedback, feedbackCategories } from \'@/mock/feedback\';', to: 'import { mockFeedback } from \'@/utils/mockData\';' },
  
  // Teams
  { from: 'import { mockTeamMembers, mockBranches } from \'@/mock/teams\';', to: 'import { mockTeamMembers } from \'@/utils/mockData\'; import { useBranches } from \'@/hooks/useBranches\';' },
  
  // Trainers
  { from: 'import { mockTrainers } from \'@/mock/trainers\';', to: 'import { useTrainers } from \'@/hooks/useTrainers\';' },
  { from: 'import { mockEnhancedTrainers } from \'@/mock/enhanced-trainers\';', to: 'import { mockEnhancedTrainers } from \'@/utils/mockData\';' },
  
  // Leads
  { from: 'import { mockLeads, leadSources } from \'@/mock/leads\';', to: 'import { mockLeads } from \'@/utils/mockData\';' },
  
  // Lockers
  { from: 'import { mockLockers, mockLockerSizes, lockerStatuses } from \'@/mock/lockers\';', to: 'import { mockLockers, mockLockerSizes } from \'@/utils/mockData\';' },
  
  // Products
  { from: 'import { mockProducts } from \'@/mock/products\';', to: 'import { mockProducts } from \'@/utils/mockData\';' },
  
  // Attendance
  { from: 'import { mockAttendanceSummary, mockAttendanceData } from \'@/mock/attendance\';', to: 'import { mockAttendanceSummary, mockAttendanceData } from \'@/utils/mockData\';' },
  
  // Membership
  { from: 'import { mockMembershipData, mockBillingHistory, mockBenefits } from \'@/mock/membership\';', to: 'import { mockMembershipData, mockBillingHistory, mockBenefits } from \'@/utils/mockData\';' }
];

// Additional data needed in mockData.ts
export const additionalMockData = `
// Additional mock data for compatibility
export const feedbackCategories: any[] = [];
export const leadSources: any[] = [];
export const lockerStatuses: any[] = [];
export const mockMembershipData: any = {};
export const mockBillingHistory: any[] = [];
export const mockBenefits: any[] = [];
`;