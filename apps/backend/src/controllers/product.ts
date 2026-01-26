import { Request, Response } from 'express';
import { ProductService } from '../services/product.js';

const productService = new ProductService();

export class ProductController {
    public async getProducts(req: Request, res: Response) {
        try {
            const products = await productService.getProducts();
            res.json(products);
        } catch (error: any) {
            console.error('Error fetching products:', error);
            res.status(500).json({ error: error.message });
        }
    }

    public async getProduct(req: Request, res: Response) {
        try {
            const product = await productService.getProduct(req.params.productId);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json(product);
        } catch (error: any) {
            console.error('Error fetching product:', error);
            res.status(500).json({ error: error.message });
        }
    }

    public async upsertProduct(req: Request, res: Response) {
        const { productId } = req.params;
        const { name, openApiUrl, baseUrl } = req.body;

        try {
            const product = await productService.upsertProduct(productId, { name, openApiUrl, baseUrl });
            res.json({ success: true, product });
        } catch (error: any) {
            console.error('Error saving product:', error);
            res.status(500).json({ error: error.message });
        }
    }
}
