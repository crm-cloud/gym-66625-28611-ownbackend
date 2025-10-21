import { useApiQuery, useApiMutation } from './useApiQuery';
import { 
  CreateEmailTemplateInput, 
  UpdateEmailTemplateInput, 
  CreateSmsTemplateInput, 
  UpdateSmsTemplateInput, 
  TemplatesQueryParams 
} from '@/types/templates';

// Email Templates
export const useEmailTemplates = (params?: TemplatesQueryParams) => {
  return useApiQuery(
    ['email-templates', JSON.stringify(params)],
    `/api/templates/email${params ? '?' + new URLSearchParams(params as any).toString() : ''}`
  );
};

export const useEmailTemplate = (templateId: string) => {
  return useApiQuery(
    ['email-template', templateId],
    `/api/templates/email/${templateId}`,
    { enabled: !!templateId }
  );
};

export const useCreateEmailTemplate = () => {
  return useApiMutation<any, CreateEmailTemplateInput>(
    '/api/templates/email',
    'post',
    {
      invalidateQueries: [['email-templates']],
      successMessage: 'Email template created successfully'
    }
  );
};

export const useUpdateEmailTemplate = (templateId: string) => {
  return useApiMutation<any, UpdateEmailTemplateInput>(
    `/api/templates/email/${templateId}`,
    'put',
    {
      invalidateQueries: [['email-templates'], ['email-template', templateId]],
      successMessage: 'Email template updated successfully'
    }
  );
};

export const useDeleteEmailTemplate = (templateId: string) => {
  return useApiMutation(
    `/api/templates/email/${templateId}`,
    'delete',
    {
      invalidateQueries: [['email-templates'], ['email-template', templateId]],
      successMessage: 'Email template deleted successfully'
    }
  );
};

// SMS Templates
export const useSmsTemplates = (params?: TemplatesQueryParams) => {
  return useApiQuery(
    ['sms-templates', JSON.stringify(params)],
    `/api/templates/sms${params ? '?' + new URLSearchParams(params as any).toString() : ''}`
  );
};

export const useSmsTemplate = (templateId: string) => {
  return useApiQuery(
    ['sms-template', templateId],
    `/api/templates/sms/${templateId}`,
    { enabled: !!templateId }
  );
};

export const useCreateSmsTemplate = () => {
  return useApiMutation<any, CreateSmsTemplateInput>(
    '/api/templates/sms',
    'post',
    {
      invalidateQueries: [['sms-templates']],
      successMessage: 'SMS template created successfully'
    }
  );
};

export const useUpdateSmsTemplate = (templateId: string) => {
  return useApiMutation<any, UpdateSmsTemplateInput>(
    `/api/templates/sms/${templateId}`,
    'put',
    {
      invalidateQueries: [['sms-templates'], ['sms-template', templateId]],
      successMessage: 'SMS template updated successfully'
    }
  );
};

export const useDeleteSmsTemplate = (templateId: string) => {
  return useApiMutation(
    `/api/templates/sms/${templateId}`,
    'delete',
    {
      invalidateQueries: [['sms-templates'], ['sms-template', templateId]],
      successMessage: 'SMS template deleted successfully'
    }
  );
};
