
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
export type LeadSource = 'website' | 'referral' | 'social' | 'walk-in' | 'phone' | 'email' | 'event';
export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  interestedPrograms: string[];
  message?: string;
  assignedTo?: string; // User ID
  createdAt: Date;
  updatedAt: Date;
  lastContactDate?: Date;
  nextFollowUpDate?: Date;
  notes: Note[];
  tasks: Task[];
  referredBy?: string; // Member ID for referrals
  conversionDate?: Date;
  estimatedValue?: number;
  tags: string[];
}

export interface Note {
  id: string;
  leadId: string;
  content: string;
  createdBy: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  leadId: string;
  title: string;
  description?: string;
  assignedTo: string;
  dueDate: Date;
  completed: boolean;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  priority: 'low' | 'medium' | 'high';
  type: 'call' | 'email' | 'meeting' | 'follow-up' | 'other';
}

export interface LeadFilters {
  status?: LeadStatus[];
  source?: LeadSource[];
  priority?: LeadPriority[];
  assignedTo?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  searchTerm?: string;
}

export interface LeadStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  conversionRate: number;
  averageResponseTime: number;
  leadsThisMonth: number;
  leadsLastMonth: number;
}
