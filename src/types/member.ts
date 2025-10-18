export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

export type GovernmentIdType = 'aadhaar' | 'pan' | 'passport' | 'voter-id';

export type MembershipStatus = 'active' | 'expired' | 'not-assigned';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Measurements {
  height: number; // in cm
  weight: number; // in kg
  fatPercentage?: number;
  musclePercentage?: number;
  bmi?: number;
}

export interface GovernmentId {
  type: GovernmentIdType;
  number: string;
}

export interface Member {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: Date;
  gender: Gender;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  governmentId: GovernmentId;
  measurements: Measurements;
  emergencyContact: EmergencyContact;
  profilePhoto?: string;
  branchId: string;
  branchName: string;
  membershipStatus: MembershipStatus;
  membershipPlan?: string;
  trainerId?: string;
  trainerName?: string;
  joinedDate: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  pointsBalance?: number;
  referralCodeUsed?: string;
  userId?: string; // Add this field for linking to user accounts
}

export interface MemberFormData {
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: Date;
  gender: Gender;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  governmentId: GovernmentId;
  measurements: Measurements;
  emergencyContact: EmergencyContact;
  profilePhoto?: string;
  branchId: string;
  trainerId?: string;
  enableLogin?: boolean;
  password?: string;
}

export interface MemberFilters {
  branchId?: string;
  membershipStatus?: MembershipStatus;
  searchQuery?: string;
}