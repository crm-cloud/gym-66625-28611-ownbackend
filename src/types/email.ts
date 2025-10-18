
export interface EmailProvider {
  id: string;
  name: string;
  type: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
  icon?: string;
}

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
}

export interface SendGridConfig {
  apiKey: string;
}

export interface MailgunConfig {
  apiKey: string;
  domain: string;
}

export interface SESConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

export type EmailConfig = SMTPConfig | SendGridConfig | MailgunConfig | SESConfig;

export interface EmailSettings {
  id: string;
  branchId: string;
  providerId: string;
  providerType: EmailProvider['type'];
  config: EmailConfig;
  isActive: boolean;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailTemplate {
  id: string;
  branchId: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  category: 'welcome' | 'membership' | 'payment' | 'reminder' | 'notification' | 'custom';
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailLog {
  id: string;
  branchId: string;
  templateId?: string;
  recipientEmail: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  error?: string;
  sentAt?: Date;
  createdAt: Date;
}

export interface EmailTestResult {
  success: boolean;
  message: string;
  details?: any;
}
