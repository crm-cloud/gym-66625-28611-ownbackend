import { Request, Response } from 'express';
import { equipmentService } from '../services/equipment.service';
import {
  createEquipmentSchema,
  updateEquipmentSchema,
  equipmentFiltersSchema
} from '../validation/equipment.validation';

export const equipmentController = {
  async getEquipment(req: Request, res: Response) {
    try {
      const filters = equipmentFiltersSchema.parse(req.query);
      const result = await equipmentService.getEquipment(filters);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getEquipmentById(req: Request, res: Response) {
    try {
      const equipment = await equipmentService.getEquipmentById(req.params.id);
      if (!equipment) {
        return res.status(404).json({ error: 'Equipment not found' });
      }
      res.json(equipment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createEquipment(req: Request, res: Response) {
    try {
      const data = createEquipmentSchema.parse(req.body);
      const equipment = await equipmentService.createEquipment(data);
      res.status(201).json(equipment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateEquipment(req: Request, res: Response) {
    try {
      const data = updateEquipmentSchema.parse(req.body);
      const equipment = await equipmentService.updateEquipment(req.params.id, data);
      res.json(equipment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteEquipment(req: Request, res: Response) {
    try {
      await equipmentService.deleteEquipment(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
