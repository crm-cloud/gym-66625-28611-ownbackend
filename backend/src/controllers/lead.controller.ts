import { Request, Response, NextFunction } from 'express';
import { leadService } from '../services/lead.service';
import { createLeadSchema, updateLeadSchema, leadQuerySchema, createFollowUpSchema, convertLeadSchema } from '../validation/lead.validation';

export class LeadController {
  async createLead(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createLeadSchema.parse(req.body);
      const lead = await leadService.createLead(data, req.user!.userId);
      res.status(201).json({ message: 'Lead created successfully', lead });
    } catch (error) { next(error); }
  }

  async getLeads(req: Request, res: Response, next: NextFunction) {
    try {
      const query = leadQuerySchema.parse({ ...req.query, page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 50 });
      const result = await leadService.getLeads(query, req.user!.role, req.user!.branchId);
      res.json(result);
    } catch (error) { next(error); }
  }

  async getLeadById(req: Request, res: Response, next: NextFunction) {
    try {
      const lead = await leadService.getLeadById(req.params.id);
      res.json(lead);
    } catch (error) { next(error); }
  }

  async updateLead(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateLeadSchema.parse(req.body);
      const lead = await leadService.updateLead(req.params.id, data);
      res.json({ message: 'Lead updated successfully', lead });
    } catch (error) { next(error); }
  }

  async deleteLead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await leadService.deleteLead(req.params.id);
      res.json(result);
    } catch (error) { next(error); }
  }

  async addFollowUp(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createFollowUpSchema.parse(req.body);
      const result = await leadService.addFollowUp(data, req.user!.userId);
      res.json(result);
    } catch (error) { next(error); }
  }

  async convertLead(req: Request, res: Response, next: NextFunction) {
    try {
      const data = convertLeadSchema.parse(req.body);
      const result = await leadService.convertLead(req.params.id, data, req.user!.userId);
      res.json(result);
    } catch (error) { next(error); }
  }

  async getLeadStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { branch_id } = req.query;
      const stats = await leadService.getLeadStats(branch_id as string);
      res.json(stats);
    } catch (error) { next(error); }
  }
}

export const leadController = new LeadController();
