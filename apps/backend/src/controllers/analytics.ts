import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.js';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
    public async getAnalytics(req: Request, res: Response) {
        try {
            const { productId } = req.params;
            const { startDate, endDate } = req.query;

            const analytics = await analyticsService.getAnalytics(
                productId,
                startDate as string,
                endDate as string
            );

            res.json(analytics);
        } catch (error: any) {
            console.error('Error fetching analytics:', error);
            res.status(500).json({ error: error.message });
        }
    }
}
