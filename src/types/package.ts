export type PackageStatus = 'active' | 'expired' | 'cancelled' | 'completed';

export interface TrainerPackageRate {
  id: string;
  trainerId?: string;
  branchId: string;
  name: string;
  sessions: number;
  price: number;
  validityDays: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface TrainerPackage {
  id: string;
  memberId: string;
  packageRateId: string;
  trainerId?: string;
  purchaseDate: string;
  expiryDate: string;
  sessionsTotal: number;
  sessionsUsed: number;
  remainingSessions: number;
  status: PackageStatus;
  paymentStatus: string;
  totalAmount: number;
  paymentId?: string;
  relatedInvoiceId?: string;
}

export interface PackageUsage {
  packageId: string;
  sessionsUsed: number;
  sessionsRemaining: number;
  lastUsedAt?: string;
  assignments: number;
}

export interface CreatePackageInput {
  memberId: string;
  packageRateId: string;
  trainerId?: string;
}

export interface PackageFilters {
  memberId?: string;
  trainerId?: string;
  status?: PackageStatus;
  branchId?: string;
  search?: string;
  page?: number;
  limit?: number;
}
