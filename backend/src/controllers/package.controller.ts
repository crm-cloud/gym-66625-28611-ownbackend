import { Request, Response, NextFunction } from 'express';
import { packageService } from '../services/package.service';
import { createPackageSchema, updatePackageSchema, packageQuerySchema } from '../validation/package.validation';

export class PackageController {
  async createPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPackageSchema.parse(req.body);
      const pkg = await packageService.createPackage(data);
      res.status(201).json({ message: 'Training package created successfully', package: pkg });
    } catch (error) { next(error); }
  }

  async getPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const query = packageQuerySchema.parse({ ...req.query, page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 50 });
      const result = await packageService.getPackages(query);
      res.json(result);
    } catch (error) { next(error); }
  }

  async getPackageById(req: Request, res: Response, next: NextFunction) {
    try {
      const pkg = await packageService.getPackageById(req.params.id);
      res.json(pkg);
    } catch (error) { next(error); }
  }

  async updatePackage(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updatePackageSchema.parse(req.body);
      const pkg = await packageService.updatePackage(req.params.id, data);
      res.json({ message: 'Package updated successfully', package: pkg });
    } catch (error) { next(error); }
  }

  async getPackageUsage(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await packageService.getPackageUsage(req.params.memberId);
      res.json(stats);
    } catch (error) { next(error); }
  }
}

export const packageController = new PackageController();
