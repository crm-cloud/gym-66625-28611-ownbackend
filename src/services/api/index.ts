/**
 * API Services
 * Centralized service layer for all API operations
 */

export { BaseService } from './BaseService';
export { MemberService, type Member, type MemberFilters } from './MemberService';
export { GymService, type Gym, type GymFilters } from './GymService';
export { BranchService, type BranchFilters } from './BranchService';
export { ReportService, type RevenueByAdminReport, type RevenueByBranchReport, type PendingInvoicesReport, type MembershipSummaryReport, type LeadConversionReport } from './ReportService';
export { ReferralService, type Referral, type ReferralSettings, type ReferralAnalytics, type BonusHistory } from './ReferralService';
export { AuthService, type LoginCredentials, type RegisterData, type AuthResponse } from './AuthService';
export { UserManagementService, type CreateUserParams, type CreateUserResult } from './UserManagementService';
export { TrainerChangeService } from './TrainerChangeService';
export { TrainerReviewService } from './TrainerReviewService';

// Phase 1 Migration Services
export { MemberCreditsService } from './MemberCreditsService';
export { MembershipFreezeService } from './MembershipFreezeService';
export { MemberGoalsService } from './MemberGoalsService';
export { AnalyticsEventsService } from './AnalyticsEventsService';
export { TeamService } from './TeamService';
export { TemplateService } from './TemplateService';

// Re-export axios instance for direct access if needed
export { api } from '@/lib/axios';
