import { Request, Response, NextFunction } from 'express';
import { maintenanceService } from '../services/maintenance.service';

export class MaintenanceController {
  /**
   * Get maintenance records
   */
  async getRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        equipment_id: req.query.equipment_id as string,
        status: req.query.status as string,
        from_date: req.query.from_date as string,
        to_date: req.query.to_date as string
      };

      const records = await maintenanceService.getRecords(filters);
      res.json(records);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get record by ID
   */
  async getRecordById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const record = await maintenanceService.getRecordById(id);
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create maintenance record
   */
  async createRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await maintenanceService.createRecord(req.body, req.user!.userId);
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update maintenance record
   */
  async updateRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const record = await maintenanceService.updateRecord(id, req.body);
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete maintenance record
   */
  async deleteRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await maintenanceService.deleteRecord(id);
      res.json({ success: true, message: 'Maintenance record deleted' });
    } catch (error) {
      next(error);
    }
  }
}

export const maintenanceController = new MaintenanceController();
