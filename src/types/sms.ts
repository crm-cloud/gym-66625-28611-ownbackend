
export interface SMSProvider {
  id: string;
  name: string;
  type: 'twilio' | 'aws-sns' | 'vonage' | 'messagebird' | 'custom';
  isActive: boolean;
  config: SMSProviderConfig;
  rateLimit: {
    perMinute: number;
    perHour: number;
    perDay: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SMSProviderConfig {
  // Twilio
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  
  // AWS SNS
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  
  // Vonage
  apiKey?: string;
  apiSecret?: string;
  
  // MessageBird
  accessKey?: string;
  
  // Custom
  apiUrl?: string;
  headers?: Record<string, string>;
  method?: 'POST' | 'GET' | 'PUT';
}

export interface SMSTemplate {
  id: string;
  name: string;
  category: SMSTemplateCategory;
  event: SMSEventType;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
  language: string;
  branchId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type SMSTemplateCategory = 
  | 'membership'
  | 'classes'
  | 'payments'
  | 'appointments'
  | 'promotions'
  | 'reminders'
  | 'alerts'
  | 'welcome'
  | 'system';

export type SMSEventType =
  // Membership
  | 'member_welcome'
  | 'membership_renewal'
  | 'membership_expiry'
  | 'membership_suspended'
  | 'membership_cancelled'
  
  // Classes
  | 'class_booking_confirmed'
  | 'class_booking_cancelled'
  | 'class_reminder'
  | 'class_cancelled'
  | 'class_rescheduled'
  | 'waitlist_available'
  
  // Payments
  | 'payment_received'
  | 'payment_failed'
  | 'payment_overdue'
  | 'payment_reminder'
  | 'refund_processed'
  
  // Appointments
  | 'appointment_confirmed'
  | 'appointment_reminder'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  
  // Promotions
  | 'promotion_code'
  | 'special_offer'
  | 'birthday_offer'
  | 'referral_reward'
  
  // System
  | 'account_created'
  | 'password_reset'
  | 'security_alert'
  | 'system_maintenance';

export interface SMSSettings {
  id: string;
  branchId?: string;
  isEnabled: boolean;
  defaultProvider: string;
  fallbackProvider?: string;
  rateLimiting: {
    enabled: boolean;
    maxPerMinute: number;
    maxPerHour: number;
    maxPerDay: number;
  };
  scheduling: {
    enabled: boolean;
    allowedHours: {
      start: string;
      end: string;
    };
    timezone: string;
    blackoutDates: string[];
  };
  compliance: {
    optOutKeywords: string[];
    optInRequired: boolean;
    requireDoubleOptIn: boolean;
    autoOptOutOnStop: boolean;
  };
  notifications: {
    deliveryReports: boolean;
    failureAlerts: boolean;
    quotaWarnings: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SMSLog {
  id: string;
  messageId: string;
  branchId?: string;
  recipientId: string;
  recipientPhone: string;
  templateId?: string;
  subject: string;
  body: string;
  provider: string;
  status: SMSStatus;
  sentAt: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  cost?: number;
  segments: number;
  direction: 'outbound' | 'inbound';
  metadata: Record<string, any>;
}

export type SMSStatus = 
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'undelivered'
  | 'rejected'
  | 'cancelled';

export interface SMSVariables {
  // Member variables
  member_name: string;
  member_email: string;
  member_phone: string;
  member_id: string;
  membership_type: string;
  membership_expiry: string;
  
  // Branch variables
  branch_name: string;
  branch_address: string;
  branch_phone: string;
  branch_email: string;
  
  // Class variables
  class_name: string;
  class_date: string;
  class_time: string;
  class_instructor: string;
  class_location: string;
  
  // Payment variables
  payment_amount: string;
  payment_date: string;
  payment_method: string;
  invoice_number: string;
  
  // System variables
  company_name: string;
  current_date: string;
  current_time: string;
  unsubscribe_link: string;
}

export interface SMSAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  averageCost: number;
  topProviders: Array<{
    provider: string;
    count: number;
    successRate: number;
  }>;
  topTemplates: Array<{
    templateId: string;
    name: string;
    count: number;
    successRate: number;
  }>;
  costByProvider: Record<string, number>;
  volumeByDay: Array<{
    date: string;
    sent: number;
    delivered: number;
    failed: number;
  }>;
}
