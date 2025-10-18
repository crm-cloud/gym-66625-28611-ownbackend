
export interface MeasurementHistory {
  id: string;
  memberId: string;
  date: Date;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  bmi?: number;
  notes?: string;
  recordedBy: string;
  recordedByName: string;
  images?: string[];
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  date: Date;
  checkInTime: Date;
  checkOutTime?: Date;
  activityType: 'gym' | 'class' | 'personal-training';
  activityId?: string;
  activityName?: string;
  branchId: string;
  branchName: string;
}

export interface MemberGoal {
  id: string;
  memberId: string;
  type: 'weight-loss' | 'weight-gain' | 'muscle-gain' | 'endurance' | 'strength' | 'custom';
  title: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  targetDate?: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressSummary {
  memberId: string;
  currentWeight?: number;
  weightChange?: number;
  weightChangePercentage?: number;
  bmiChange?: number;
  bodyFatChange?: number;
  muscleMassChange?: number;
  totalVisits: number;
  visitsThisMonth: number;
  lastVisit?: Date;
  consecutiveDays: number;
  averageVisitsPerWeek: number;
}
