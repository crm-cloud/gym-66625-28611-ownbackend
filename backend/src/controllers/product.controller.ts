import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { createProductSchema, updateProductSchema, productFiltersSchema } from '../validation/product.validation';

export const productController = {
  async getProducts(req: Request, res: Response) {
    try {
      const filters = productFiltersSchema.parse(req.query);
      const result = await productService.getProducts(filters);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getProduct(req: Request, res: Response) {
    try {
      const product = await productService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createProduct(req: Request, res: Response) {
    try {
      const data = createProductSchema.parse(req.body);
      const product = await productService.createProduct(data);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateProduct(req: Request, res: Response) {
    try {
      const data = updateProductSchema.parse(req.body);
      const product = await productService.updateProduct(req.params.id, data);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteProduct(req: Request, res: Response) {
    try {
      await productService.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
