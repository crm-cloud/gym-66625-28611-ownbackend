import { Request, Response, NextFunction } from 'express';
import { templatesService } from '../services/templates.service';
import { createEmailTemplateSchema, updateEmailTemplateSchema, createSmsTemplateSchema, updateSmsTemplateSchema, templatesQuerySchema } from '../validation/templates.validation';

export class TemplatesController {
  // Email Templates
  async createEmailTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createEmailTemplateSchema.parse(req.body);
      const template = await templatesService.createEmailTemplate(data, req.user!.userId);

      res.status(201).json({
        message: 'Email template created successfully',
        template
      });
    } catch (error) {
      next(error);
    }
  }

  async getEmailTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const query = templatesQuerySchema.parse({
        ...req.query,
        is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 50
      });

      const result = await templatesService.getEmailTemplates(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getEmailTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateId } = req.params;
      const template = await templatesService.getEmailTemplate(templateId);
      res.json(template);
    } catch (error) {
      next(error);
    }
  }

  async updateEmailTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateId } = req.params;
      const data = updateEmailTemplateSchema.parse(req.body);
      const template = await templatesService.updateEmailTemplate(templateId, data);

      res.json({
        message: 'Email template updated successfully',
        template
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteEmailTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateId } = req.params;
      await templatesService.deleteEmailTemplate(templateId);

      res.json({ message: 'Email template deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // SMS Templates
  async createSmsTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSmsTemplateSchema.parse(req.body);
      const template = await templatesService.createSmsTemplate(data, req.user!.userId);

      res.status(201).json({
        message: 'SMS template created successfully',
        template
      });
    } catch (error) {
      next(error);
    }
  }

  async getSmsTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const query = templatesQuerySchema.parse({
        ...req.query,
        is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 50
      });

      const result = await templatesService.getSmsTemplates(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSmsTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateId } = req.params;
      const template = await templatesService.getSmsTemplate(templateId);
      res.json(template);
    } catch (error) {
      next(error);
    }
  }

  async updateSmsTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateId } = req.params;
      const data = updateSmsTemplateSchema.parse(req.body);
      const template = await templatesService.updateSmsTemplate(templateId, data);

      res.json({
        message: 'SMS template updated successfully',
        template
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSmsTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateId } = req.params;
      await templatesService.deleteSmsTemplate(templateId);

      res.json({ message: 'SMS template deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const templatesController = new TemplatesController();
