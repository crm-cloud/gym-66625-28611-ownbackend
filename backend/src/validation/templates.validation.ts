import { z } from 'zod';

// Email template schema
export const createEmailTemplateSchema = z.object({
  name: z.string().min(2, 'Template name is required'),
  subject: z.string().min(2, 'Subject is required'),
  body: z.string().min(10, 'Body must be at least 10 characters'),
  template_type: z.enum(['welcome', 'renewal', 'expiry', 'payment', 'announcement', 'custom']),
  branch_id: z.string().uuid().optional(),
  variables: z.array(z.string()).optional(),
  is_active: z.boolean().default(true)
});

export const updateEmailTemplateSchema = createEmailTemplateSchema.partial();

// SMS template schema
export const createSmsTemplateSchema = z.object({
  name: z.string().min(2, 'Template name is required'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message too long'),
  template_type: z.enum(['welcome', 'renewal', 'expiry', 'payment', 'reminder', 'custom']),
  branch_id: z.string().uuid().optional(),
  variables: z.array(z.string()).optional(),
  is_active: z.boolean().default(true)
});

export const updateSmsTemplateSchema = createSmsTemplateSchema.partial();

// Query schema
export const templatesQuerySchema = z.object({
  template_type: z.string().optional(),
  branch_id: z.string().uuid().optional(),
  is_active: z.boolean().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(50)
});

export type CreateEmailTemplateInput = z.infer<typeof createEmailTemplateSchema>;
export type UpdateEmailTemplateInput = z.infer<typeof updateEmailTemplateSchema>;
export type CreateSmsTemplateInput = z.infer<typeof createSmsTemplateSchema>;
export type UpdateSmsTemplateInput = z.infer<typeof updateSmsTemplateSchema>;
export type TemplatesQueryInput = z.infer<typeof templatesQuerySchema>;
