import { Request, Response } from "express";
import { ProductService } from "../services/product.js";

const productService = new ProductService();

export class ProductController {
  public async getProducts(req: Request, res: Response) {
    try {
      const products = await productService.getProducts();
      res.json(products);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: error.message });
    }
  }

  public async getProduct(req: Request, res: Response) {
    try {
      const product = await productService.getProduct(req.params.productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: error.message });
    }
  }

  public async upsertProduct(req: Request, res: Response) {
    const { productId } = req.params;
    const { name, openApiUrl, baseUrl } = req.body;

    try {
      const product = await productService.upsertProduct(productId, {
        name,
        openApiUrl,
        baseUrl,
      });
      res.json({ success: true, product });
    } catch (error: any) {
      console.error("Error saving product:", error);
      res.status(500).json({ error: error.message });
    }
  }

  public async updateProduct(req: Request, res: Response) {
    const { productId } = req.params;
    const { name, openApiUrl, baseUrl, authType, authKeyName } = req.body;

    try {
      const product = await productService.updateProduct(productId, {
        name,
        openApiUrl,
        baseUrl,
        authType,
        authKeyName,
      });
      res.json({ success: true, product });
    } catch (error: any) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: error.message });
    }
  }

  public async getEndpoints(req: Request, res: Response) {
    try {
      const endpoints = await productService.getEndpoints(req.params.productId);
      res.json(endpoints);
    } catch (error: any) {
      console.error("Error fetching endpoints:", error);
      if (error.message === "Product not found") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  public async toggleEndpoint(req: Request, res: Response) {
    const { productId, operationId } = req.params;
    const { enabled, method, path } = req.body;

    try {
      const config = await productService.toggleEndpoint(
        productId,
        operationId,
        enabled,
        method,
        path,
      );
      res.json({ success: true, config });
    } catch (error: any) {
      console.error("Error toggling endpoint:", error);
      res.status(500).json({ error: error.message });
    }
  }
}
