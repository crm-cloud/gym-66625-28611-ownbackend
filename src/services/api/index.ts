/**
 * API Services
 * Centralized service layer for all API operations
 */

export { BaseService } from './BaseService';
export { MemberService, type Member, type MemberFilters } from './MemberService';
export { GymService, type Gym, type GymFilters } from './GymService';
export { BranchService, type Branch, type BranchFilters } from './BranchService';
export { ReportService, type RevenueByAdminReport, type RevenueByBranchReport, type PendingInvoicesReport, type MembershipSummaryReport, type LeadConversionReport } from './ReportService';
export { ReferralService, type Referral, type ReferralSettings, type ReferralAnalytics, type BonusHistory } from './ReferralService';
export { AuthService, type LoginCredentials, type RegisterData, type AuthResponse } from './AuthService';

// Re-export axios instance for direct access if needed
export { api } from '@/lib/axios';
