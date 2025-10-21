import { BaseService } from './BaseService';
import { 
  EmailTemplate, 
  SmsTemplate, 
  CreateEmailTemplateInput, 
  UpdateEmailTemplateInput, 
  CreateSmsTemplateInput, 
  UpdateSmsTemplateInput, 
  TemplatesQueryParams 
} from '@/types/templates';

class TemplateServiceClass extends BaseService {
  constructor() {
    super('templates');
  }

  // Email Templates
  async createEmailTemplate(data: CreateEmailTemplateInput): Promise<EmailTemplate> {
    const response = await this.post<{ template: EmailTemplate }>('/email', data);
    return response.template;
  }

  async getEmailTemplates(params?: TemplatesQueryParams): Promise<{
    templates: EmailTemplate[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.get<any>('/email', params);
  }

  async getEmailTemplate(templateId: string): Promise<EmailTemplate> {
    return this.get<EmailTemplate>(`/email/${templateId}`);
  }

  async updateEmailTemplate(templateId: string, data: UpdateEmailTemplateInput): Promise<EmailTemplate> {
    const response = await this.put<{ template: EmailTemplate }>(`/email/${templateId}`, data);
    return response.template;
  }

  async deleteEmailTemplate(templateId: string): Promise<void> {
    await this.delete(`/email/${templateId}`);
  }

  // SMS Templates
  async createSmsTemplate(data: CreateSmsTemplateInput): Promise<SmsTemplate> {
    const response = await this.post<{ template: SmsTemplate }>('/sms', data);
    return response.template;
  }

  async getSmsTemplates(params?: TemplatesQueryParams): Promise<{
    templates: SmsTemplate[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.get<any>('/sms', params);
  }

  async getSmsTemplate(templateId: string): Promise<SmsTemplate> {
    return this.get<SmsTemplate>(`/sms/${templateId}`);
  }

  async updateSmsTemplate(templateId: string, data: UpdateSmsTemplateInput): Promise<SmsTemplate> {
    const response = await this.put<{ template: SmsTemplate }>(`/sms/${templateId}`, data);
    return response.template;
  }

  async deleteSmsTemplate(templateId: string): Promise<void> {
    await this.delete(`/sms/${templateId}`);
  }
}

export const TemplateService = new TemplateServiceClass();
