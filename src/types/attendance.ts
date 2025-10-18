export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: 'member' | 'trainer' | 'staff' | 'admin';
  branchId: string;
  branchName: string;
  checkInTime: Date;
  checkOutTime?: Date;
  entryMethod: 'biometric' | 'manual' | 'card' | 'mobile';
  deviceId?: string;
  deviceLocation?: string;
  status: 'checked-in' | 'checked-out' | 'no-show' | 'late';
  notes?: string;
  duration?: number; // in minutes
  isLate: boolean;
  expectedCheckIn?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  workShift?: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
  };
  membershipId?: string;
  classId?: string;
  className?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceFilter {
  branchId?: string;
  userId?: string;
  userRole?: string;
  status?: string;
  entryMethod?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isLate?: boolean;
  deviceId?: string;
  classId?: string;
  workShiftId?: string;
  searchTerm?: string;
}

export interface AttendanceSummary {
  totalRecords: number;
  totalMembers: number;
  totalStaff: number;
  checkedInCount: number;
  checkedOutCount: number;
  lateArrivals: number;
  noShows: number;
  averageDuration: number;
  peakHours: {
    hour: number;
    count: number;
  }[];
  busyDays: {
    day: string;
    count: number;
  }[];
  methodBreakdown: {
    biometric: number;
    manual: number;
    card: number;
    mobile: number;
  };
  branchBreakdown: {
    branchId: string;
    branchName: string;
    count: number;
  }[];
}

export interface BiometricDevice {
  id: string;
  name: string;
  model: string;
  ipAddress: string;
  location: string;
  branchId: string;
  branchName: string;
  status: 'online' | 'offline' | 'maintenance';
  lastSync: Date;
  totalRecords: number;
  isActive: boolean;
  settings: {
    syncInterval: number; // minutes
    autoApproval: boolean;
    requirePhoto: boolean;
    workingHours: {
      start: string;
      end: string;
    };
  };
}

export interface WorkShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  branchId: string;
  days: string[];
  userIds: string[];
  isActive: boolean;
  gracePeriod: number; // minutes
  lateThreshold: number; // minutes
  breakDuration: number; // minutes
  minimumHours: number;
  maximumHours: number;
}

export interface AttendanceReport {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  parameters: {
    branchIds?: string[];
    userIds?: string[];
    dateRange: {
      start: Date;
      end: Date;
    };
    includeBreakdown: boolean;
    includeCharts: boolean;
  };
  generatedAt: Date;
  generatedBy: string;
  status: 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
  format: 'pdf' | 'excel' | 'csv';
}

export interface AttendanceSettings {
  autoApprovalEnabled: boolean;
  gracePeriodMinutes: number;
  lateThresholdMinutes: number;
  requireCheckout: boolean;
  allowManualEntry: boolean;
  allowMobileCheckIn: boolean;
  geofencingEnabled: boolean;
  geofenceRadius: number; // meters
  workingHours: {
    start: string;
    end: string;
  };
  notifications: {
    lateArrival: boolean;
    noShow: boolean;
    earlyDeparture: boolean;
    overtime: boolean;
  };
  integrations: {
    payrollEnabled: boolean;
    leaveManagementEnabled: boolean;
    hikvisionEnabled: boolean;
    hikvisionSettings?: {
    serverUrl: string;
    username: string;
    syncInterval: number;
    };
  };
}