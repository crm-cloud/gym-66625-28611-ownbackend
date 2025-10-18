import { Request, Response } from 'express';
import { attendanceService } from '../services/attendance.service';
import {
  createAttendanceSchema,
  updateAttendanceSchema,
  attendanceFiltersSchema,
  createDeviceSchema,
  updateDeviceSchema
} from '../validation/attendance.validation';

export const attendanceController = {
  async getAttendance(req: Request, res: Response) {
    try {
      const filters = attendanceFiltersSchema.parse(req.query);
      const result = await attendanceService.getAttendance(filters);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async createAttendance(req: Request, res: Response) {
    try {
      const data = createAttendanceSchema.parse(req.body);
      const attendance = await attendanceService.createAttendance(data);
      res.status(201).json(attendance);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateAttendance(req: Request, res: Response) {
    try {
      const data = updateAttendanceSchema.parse(req.body);
      const attendance = await attendanceService.updateAttendance(req.params.id, data);
      res.json(attendance);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getDevices(req: Request, res: Response) {
    try {
      const branchId = req.query.branch_id as string;
      const devices = await attendanceService.getDevices(branchId);
      res.json(devices);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createDevice(req: Request, res: Response) {
    try {
      const data = createDeviceSchema.parse(req.body);
      const device = await attendanceService.createDevice(data);
      res.status(201).json(device);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateDevice(req: Request, res: Response) {
    try {
      const data = updateDeviceSchema.parse(req.body);
      const device = await attendanceService.updateDevice(req.params.id, data);
      res.json(device);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};
