// Communication Templates Types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  template_type: 'welcome' | 'renewal' | 'expiry' | 'payment' | 'announcement' | 'custom';
  branch_id?: string;
  variables?: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SmsTemplate {
  id: string;
  name: string;
  message: string;
  template_type: 'welcome' | 'renewal' | 'expiry' | 'payment' | 'reminder' | 'custom';
  branch_id?: string;
  variables?: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmailTemplateInput {
  name: string;
  subject: string;
  body: string;
  template_type: 'welcome' | 'renewal' | 'expiry' | 'payment' | 'announcement' | 'custom';
  branch_id?: string;
  variables?: string[];
  is_active?: boolean;
}

export interface UpdateEmailTemplateInput {
  name?: string;
  subject?: string;
  body?: string;
  template_type?: 'welcome' | 'renewal' | 'expiry' | 'payment' | 'announcement' | 'custom';
  branch_id?: string;
  variables?: string[];
  is_active?: boolean;
}

export interface CreateSmsTemplateInput {
  name: string;
  message: string;
  template_type: 'welcome' | 'renewal' | 'expiry' | 'payment' | 'reminder' | 'custom';
  branch_id?: string;
  variables?: string[];
  is_active?: boolean;
}

export interface UpdateSmsTemplateInput {
  name?: string;
  message?: string;
  template_type?: 'welcome' | 'renewal' | 'expiry' | 'payment' | 'reminder' | 'custom';
  branch_id?: string;
  variables?: string[];
  is_active?: boolean;
}

export interface TemplatesQueryParams {
  template_type?: string;
  branch_id?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}
