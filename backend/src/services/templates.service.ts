import prisma from '../config/database';
import { CreateEmailTemplateInput, UpdateEmailTemplateInput, CreateSmsTemplateInput, UpdateSmsTemplateInput, TemplatesQueryInput } from '../validation/templates.validation';

export class TemplatesService {
  // Email Templates
  async createEmailTemplate(data: CreateEmailTemplateInput, createdBy: string) {
    const template = await prisma.email_templates.create({
      data: {
        ...data,
        created_by: createdBy
      }
    });

    return template;
  }

  async getEmailTemplates(query: TemplatesQueryInput) {
    const { template_type, branch_id, is_active, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (template_type) where.template_type = template_type;
    if (branch_id) where.branch_id = branch_id;
    if (is_active !== undefined) where.is_active = is_active;

    const [templates, total] = await Promise.all([
      prisma.email_templates.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.email_templates.count({ where })
    ]);

    return {
      templates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getEmailTemplate(templateId: string) {
    const template = await prisma.email_templates.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new Error('Email template not found');
    }

    return template;
  }

  async updateEmailTemplate(templateId: string, data: UpdateEmailTemplateInput) {
    const template = await prisma.email_templates.update({
      where: { id: templateId },
      data
    });

    return template;
  }

  async deleteEmailTemplate(templateId: string) {
    await prisma.email_templates.delete({
      where: { id: templateId }
    });
  }

  // SMS Templates
  async createSmsTemplate(data: CreateSmsTemplateInput, createdBy: string) {
    const template = await prisma.sms_templates.create({
      data: {
        ...data,
        created_by: createdBy
      }
    });

    return template;
  }

  async getSmsTemplates(query: TemplatesQueryInput) {
    const { template_type, branch_id, is_active, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (template_type) where.template_type = template_type;
    if (branch_id) where.branch_id = branch_id;
    if (is_active !== undefined) where.is_active = is_active;

    const [templates, total] = await Promise.all([
      prisma.sms_templates.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.sms_templates.count({ where })
    ]);

    return {
      templates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getSmsTemplate(templateId: string) {
    const template = await prisma.sms_templates.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new Error('SMS template not found');
    }

    return template;
  }

  async updateSmsTemplate(templateId: string, data: UpdateSmsTemplateInput) {
    const template = await prisma.sms_templates.update({
      where: { id: templateId },
      data
    });

    return template;
  }

  async deleteSmsTemplate(templateId: string) {
    await prisma.sms_templates.delete({
      where: { id: templateId }
    });
  }
}

export const templatesService = new TemplatesService();
