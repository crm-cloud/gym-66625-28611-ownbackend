import { Request, Response } from 'express';
import { announcementService } from '../services/announcement.service';
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  announcementFiltersSchema
} from '../validation/announcement.validation';

export const announcementController = {
  async getAnnouncements(req: Request, res: Response) {
    try {
      const filters = announcementFiltersSchema.parse(req.query);
      const result = await announcementService.getAnnouncements(filters);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getAnnouncement(req: Request, res: Response) {
    try {
      const announcement = await announcementService.getAnnouncementById(req.params.id);
      if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }
      res.json(announcement);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createAnnouncement(req: Request, res: Response) {
    try {
      const data = createAnnouncementSchema.parse(req.body);
      const announcement = await announcementService.createAnnouncement(data);
      res.status(201).json(announcement);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateAnnouncement(req: Request, res: Response) {
    try {
      const data = updateAnnouncementSchema.parse(req.body);
      const announcement = await announcementService.updateAnnouncement(req.params.id, data);
      res.json(announcement);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteAnnouncement(req: Request, res: Response) {
    try {
      await announcementService.deleteAnnouncement(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
