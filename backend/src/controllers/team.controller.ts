import { Request, Response, NextFunction } from 'express';
import { teamService } from '../services/team.service';
import { createTeamMemberSchema, updateTeamMemberSchema, createShiftSchema, updateShiftSchema, teamQuerySchema, shiftsQuerySchema } from '../validation/team.validation';

export class TeamController {
  // Team Members
  async createTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTeamMemberSchema.parse(req.body);
      const member = await teamService.createTeamMember(data, req.user!.userId);

      res.status(201).json({
        message: 'Team member added successfully',
        member
      });
    } catch (error) {
      next(error);
    }
  }

  async getTeamMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = teamQuerySchema.parse({
        ...req.query,
        is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 50
      });

      const result = await teamService.getTeamMembers(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.params;
      const member = await teamService.getTeamMember(memberId);
      res.json(member);
    } catch (error) {
      next(error);
    }
  }

  async updateTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.params;
      const data = updateTeamMemberSchema.parse(req.body);
      const member = await teamService.updateTeamMember(memberId, data);

      res.json({
        message: 'Team member updated successfully',
        member
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.params;
      await teamService.deleteTeamMember(memberId);

      res.json({ message: 'Team member removed successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Work Shifts
  async createShift(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createShiftSchema.parse(req.body);
      const shift = await teamService.createShift(data, req.user!.userId);

      res.status(201).json({
        message: 'Shift created successfully',
        shift
      });
    } catch (error) {
      next(error);
    }
  }

  async getShifts(req: Request, res: Response, next: NextFunction) {
    try {
      const query = shiftsQuerySchema.parse({
        ...req.query,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 50
      });

      const result = await teamService.getShifts(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateShift(req: Request, res: Response, next: NextFunction) {
    try {
      const { shiftId } = req.params;
      const data = updateShiftSchema.parse(req.body);
      const shift = await teamService.updateShift(shiftId, data);

      res.json({
        message: 'Shift updated successfully',
        shift
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteShift(req: Request, res: Response, next: NextFunction) {
    try {
      const { shiftId } = req.params;
      await teamService.deleteShift(shiftId);

      res.json({ message: 'Shift deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const teamController = new TeamController();
