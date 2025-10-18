export interface Locker {
  id: string;
  name: string;
  number: string;
  branchId: string;
  branchName: string;
  size: LockerSize;
  status: LockerStatus;
  assignedMemberId?: string;
  assignedMemberName?: string;
  assignedDate?: string;
  expirationDate?: string;
  releaseDate?: string;
  monthlyFee: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LockerSize {
  id: string;
  name: string;
  dimensions: string;
  monthlyFee: number;
}

export type LockerStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';

export interface LockerAssignment {
  id: string;
  lockerId: string;
  lockerNumber: string;
  memberId: string;
  memberName: string;
  assignedDate: string;
  expirationDate?: string;
  releaseDate?: string;
  monthlyFee: number;
  status: 'active' | 'released';
  notes?: string;
}

export interface LockerFilters {
  branchId?: string;
  status?: LockerStatus | 'all';
  size?: string;
  search?: string;
}

export interface LockerSummary {
  totalLockers: number;
  availableLockers: number;
  occupiedLockers: number;
  maintenanceLockers: number;
  reservedLockers: number;
  occupancyRate: number;
  monthlyRevenue: number;
}