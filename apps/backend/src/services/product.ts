import prisma from '../lib/prisma.js';
import crypto from 'crypto';

export class ProductService {
    public async getProducts() {
        return prisma.product.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    public async getProduct(productId: string) {
        return prisma.product.findUnique({
            where: { id: productId }
        });
    }

    public async upsertProduct(productId: string, data: { name: string; openApiUrl: string; baseUrl: string }) {
        // Check if product exists
        const existing = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (existing) {
            return prisma.product.update({
                where: { id: productId },
                data
            });
        }

        // Generate API key for new products
        const apiKey = `oc_${crypto.randomBytes(24).toString('hex')}`;

        return prisma.product.create({
            data: {
                id: productId,
                name: data.name || productId,
                openApiUrl: data.openApiUrl,
                baseUrl: data.baseUrl,
                apiKey
            }
        });
    }
}
