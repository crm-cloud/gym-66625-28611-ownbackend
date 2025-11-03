import { Request, Response, NextFunction } from 'express';
import { fileUploadService } from '../services/file-upload.service';

export class FileController {
  /**
   * Upload single file
   */
  async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const result = await fileUploadService.uploadFile(req.file);
      
      res.status(201).json({
        success: true,
        url: result.url,
        file: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
      }

      const results = await fileUploadService.uploadMultipleFiles(req.files);
      
      res.status(201).json({
        success: true,
        files: results
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No avatar file provided' });
      }

      const result = await fileUploadService.uploadAvatar(req.file);
      
      res.status(201).json({
        success: true,
        url: result.url,
        file: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete file
   */
  async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileKey } = req.params;
      
      await fileUploadService.deleteFile(fileKey);
      
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const fileController = new FileController();
