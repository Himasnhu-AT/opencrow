import prisma from '../lib/prisma.js';

export class AnalyticsService {
    public async getAnalytics(productId: string, startDate?: string, endDate?: string) {
        const events = await prisma.analyticsEvent.findMany({
            where: {
                productId,
                ...(startDate && endDate ? {
                    createdAt: {
                        gte: new Date(startDate),
                        lte: new Date(endDate)
                    }
                } : {})
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        // Aggregate stats
        const stats = await prisma.analyticsEvent.groupBy({
            by: ['eventType'],
            where: { productId },
            _count: true
        });

        return { events, stats };
    }
}
