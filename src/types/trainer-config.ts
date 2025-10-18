
export interface TrainerConfigSettings {
  id: string;
  branchId: string;
  
  // Auto-Assignment Configuration
  autoAssignment: {
    enabled: boolean;
    prioritizeBy: ('specialty_match' | 'availability' | 'rating' | 'experience' | 'price')[];
    requireSpecialtyMatch: boolean;
    requireAvailability: boolean;
    maxPriceThreshold?: number;
    minRatingThreshold?: number;
    minExperienceThreshold?: number;
    enableLoadBalancing: boolean;
    maxUtilizationThreshold: number;
    assignmentWindowHours: number;
  };
  
  // Notification Preferences
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    assignmentNotifications: boolean;
    scheduleReminders: boolean;
    performanceAlerts: boolean;
    utilizationWarnings: boolean;
  };
  
  // Business Rules
  businessRules: {
    maxSessionsPerDay: number;
    maxClientsPerTrainer: number;
    minSessionGap: number; // minutes
    allowBackToBackSessions: boolean;
    requireCertificationMatch: boolean;
    enableWaitlist: boolean;
    autoRescheduleOnCancel: boolean;
  };
  
  // Performance Thresholds
  performanceThresholds: {
    minRating: number;
    minPunctualityScore: number;
    maxCancellationRate: number;
    targetUtilizationRate: number;
    reviewPeriodDays: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTemplate {
  id: string;
  type: 'assignment' | 'reminder' | 'cancellation' | 'feedback' | 'performance';
  channel: 'email' | 'sms' | 'push' | 'in_app';
  subject: string;
  template: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface ConfigurationHistory {
  id: string;
  configId: string;
  changes: Record<string, any>;
  changedBy: string;
  reason?: string;
  timestamp: Date;
}
