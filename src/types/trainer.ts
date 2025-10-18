
export type TrainerSpecialty = 
  | 'strength_training' 
  | 'cardio' 
  | 'yoga' 
  | 'pilates' 
  | 'crossfit' 
  | 'martial_arts' 
  | 'dance' 
  | 'swimming' 
  | 'rehabilitation' 
  | 'nutrition' 
  | 'weight_loss' 
  | 'bodybuilding' 
  | 'sports_performance' 
  | 'senior_fitness' 
  | 'youth_fitness';

export type TrainerStatus = 'active' | 'inactive' | 'on_leave' | 'busy';

export type CertificationLevel = 'basic' | 'intermediate' | 'advanced' | 'expert';

export interface TrainerCertification {
  id: string;
  name: string;
  issuingOrganization: string;
  level: CertificationLevel;
  issueDate: Date;
  expiryDate?: Date;
  verified: boolean;
}

export interface TrainerAvailability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
}

export interface TrainerProfile {
  id: string;
  userId: string;
  employeeId: string;
  branchId: string;
  branchName: string;
  
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  dateOfBirth?: Date;
  joinDate: Date;
  
  // Professional Information
  specialties: TrainerSpecialty[];
  certifications: TrainerCertification[];
  experience: number; // years
  bio: string;
  languages: string[];
  
  // Availability & Scheduling
  status: TrainerStatus;
  availability: TrainerAvailability[];
  maxClientsPerDay: number;
  maxClientsPerWeek: number;
  
  // Pricing & Services
  hourlyRate: number;
  packageRates: {
    sessions: number;
    price: number;
    validityDays: number;
  }[];
  
  // Performance Metrics
  rating: number;
  totalSessions: number;
  totalClients: number;
  completionRate: number;
  punctualityScore: number;
  
  // System Fields
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainerAssignment {
  id: string;
  trainerId: string;
  memberId: string;
  sessionType: 'single' | 'package';
  packageId?: string;
  
  // Session Details
  scheduledDate: Date;
  duration: number; // minutes
  sessionType_detail: TrainerSpecialty;
  notes?: string;
  
  // Status & Tracking
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  completedAt?: Date;
  memberRating?: number;
  memberFeedback?: string;
  trainerNotes?: string;
  
  // Payment Information
  isPaid: boolean;
  amount: number;
  paymentDate?: Date;
  paymentMethod?: string;
  
  // Auto-assignment metadata
  assignedBy: 'auto' | 'manual' | 'member_request';
  assignmentReason?: string;
  alternativeTrainers?: string[]; // IDs of other suitable trainers
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainerChangeRequest {
  id: string;
  memberId: string;
  currentTrainerId: string;
  requestedTrainerId?: string; // null if just requesting change
  
  reason: 'scheduling_conflict' | 'personality_mismatch' | 'specialty_change' | 'performance_issue' | 'other';
  description: string;
  urgency: 'low' | 'medium' | 'high';
  
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  
  // New assignment details (if approved)
  newTrainerId?: string;
  reassignmentDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainerUtilization {
  trainerId: string;
  period: 'daily' | 'weekly' | 'monthly';
  date: Date;
  
  // Capacity Metrics
  totalAvailableHours: number;
  bookedHours: number;
  utilizationRate: number; // percentage
  
  // Session Metrics
  scheduledSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  noShowSessions: number;
  
  // Revenue Metrics
  totalRevenue: number;
  averageSessionValue: number;
  
  // Performance Metrics
  averageRating: number;
  punctualityScore: number;
  
  createdAt: Date;
}

export interface TrainerPreference {
  memberId: string;
  preferredSpecialties: TrainerSpecialty[];
  preferredGender?: 'male' | 'female';
  preferredExperienceLevel: 'any' | 'beginner_friendly' | 'experienced' | 'expert';
  preferredLanguages: string[];
  avoidTrainerIds: string[];
  maxHourlyRate?: number;
  
  // Scheduling preferences
  preferredTimeSlots: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  
  updatedAt: Date;
}

export interface AutoAssignmentConfig {
  id: string;
  branchId: string;
  
  // Assignment Rules
  prioritizeBy: ('specialty_match' | 'availability' | 'rating' | 'experience' | 'price')[];
  requireSpecialtyMatch: boolean;
  requireAvailability: boolean;
  maxPriceThreshold?: number;
  minRatingThreshold?: number;
  minExperienceThreshold?: number;
  
  // Load Balancing
  enableLoadBalancing: boolean;
  maxUtilizationThreshold: number; // percentage
  
  // Fallback Options
  allowManualAssignment: boolean;
  notifyOnNoMatch: boolean;
  waitlistOnNoMatch: boolean;
  
  // Timing
  assignmentWindowHours: number; // how far in advance to assign
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
