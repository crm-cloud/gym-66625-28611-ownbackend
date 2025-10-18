export type ClassStatus = 'scheduled' | 'completed' | 'cancelled';

export type ClassRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export type ClassTag = 'strength' | 'cardio' | 'flexibility' | 'dance' | 'martial-arts' | 'water' | 'mind-body';

export interface GymClass {
  id: string;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  recurrence: ClassRecurrence;
  trainerId: string;
  trainerName: string;
  branchId: string;
  branchName: string;
  capacity: number;
  enrolledCount: number;
  tags: ClassTag[];
  status: ClassStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassEnrollment {
  id: string;
  classId: string;
  memberId: string;
  memberName: string;
  enrolledAt: Date;
  status: 'enrolled' | 'attended' | 'no-show' | 'cancelled';
  notes?: string;
}

export interface ClassFormData {
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  recurrence: ClassRecurrence;
  trainerId: string;
  branchId: string;
  capacity: number;
  tags: ClassTag[];
}

export interface ClassFilters {
  branchId?: string;
  trainerId?: string;
  tag?: ClassTag;
  date?: Date;
  status?: ClassStatus;
}