import { Router } from 'express';
import { ProductController } from '../controllers/product.js';
import { ChatController } from '../controllers/chat.js';
import { AnalyticsController } from '../controllers/analytics.js';

const router = Router();
const productController = new ProductController();
const chatController = new ChatController();
const analyticsController = new AnalyticsController();

// Product Routes
router.get('/products', (req, res) => productController.getProducts(req, res));
router.get('/products/:productId', (req, res) => productController.getProduct(req, res));
router.post('/config/:productId', (req, res) => productController.upsertProduct(req, res));

// Chat Routes
router.post('/chat', (req, res) => chatController.processChat(req, res));
router.get('/messages/:sessionId', (req, res) => chatController.getMessages(req, res));

// Analytics Routes
router.get('/analytics/:productId', (req, res) => analyticsController.getAnalytics(req, res));

export default router;
