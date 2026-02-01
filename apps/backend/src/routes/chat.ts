import { Router } from "express";
import { ProductController } from "../controllers/product.js";
import { ChatController } from "../controllers/chat.js";
import { AnalyticsController } from "../controllers/analytics.js";
import { KnowledgeController } from "../controllers/knowledge.js";
import { validate } from "../middleware/validate.js";
import {
  createProductSchema,
  updateProductSchema,
  chatRequestSchema,
} from "../schemas/index.js";

const router = Router();
const productController = new ProductController();
const chatController = new ChatController();
const analyticsController = new AnalyticsController();
const knowledgeController = new KnowledgeController();

// Product Routes

/**
 * @swagger
 * /api/config/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/products", (req, res) => productController.getProducts(req, res));

/**
 * @swagger
 * /api/config/products/{productId}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get("/products/:productId", (req, res) =>
  productController.getProduct(req, res),
);

/**
 * @swagger
 * /api/config/{productId}:
 *   post:
 *     summary: Create or update a product configuration
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductConfig'
 *     responses:
 *       200:
 *         description: Product configuration updated
 */
router.post("/config/:productId", validate(createProductSchema), (req, res) =>
  productController.upsertProduct(req, res),
);

/**
 * @swagger
 * /api/config/products/{productId}:
 *   patch:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductUpdate'
 *     responses:
 *       200:
 *         description: Product updated
 */
router.patch(
  "/products/:productId",
  validate(updateProductSchema),
  (req, res) => productController.updateProduct(req, res),
);

/**
 * @swagger
 * /api/config/products/{productId}/sessions:
 *   get:
 *     summary: Get chat sessions for a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of chat sessions
 */
router.get("/products/:productId/sessions", (req, res) =>
  chatController.getSessions(req, res),
);

// Endpoints Routes

/**
 * @swagger
 * /api/config/products/{productId}/endpoints:
 *   get:
 *     summary: Get API endpoints for a product
 *     tags: [Endpoints]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of endpoints
 */
router.get("/products/:productId/endpoints", (req, res) =>
  productController.getEndpoints(req, res),
);

/**
 * @swagger
 * /api/config/products/{productId}/endpoints/{operationId}:
 *   patch:
 *     summary: Toggle or update an endpoint
 *     tags: [Endpoints]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: operationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *               method:
 *                 type: string
 *               path:
 *                 type: string
 *     responses:
 *       200:
 *         description: Endpoint updated
 */
router.patch("/products/:productId/endpoints/:operationId", (req, res) =>
  productController.toggleEndpoint(req, res),
);

// Knowledge Routes

/**
 * @swagger
 * /api/config/products/{productId}/knowledge:
 *   get:
 *     summary: Get knowledge sources
 *     tags: [Knowledge]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of knowledge sources
 */
router.get("/products/:productId/knowledge", (req, res) =>
  knowledgeController.getSources(req, res),
);

/**
 * @swagger
 * /api/config/products/{productId}/knowledge:
 *   post:
 *     summary: Add a knowledge source
 *     tags: [Knowledge]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - name
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [url, file]
 *               name:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Source added
 */
router.post("/products/:productId/knowledge", (req, res) =>
  knowledgeController.addSource(req, res),
);

/**
 * @swagger
 * /api/config/products/{productId}/knowledge/{sourceId}:
 *   delete:
 *     summary: Remove a knowledge source
 *     tags: [Knowledge]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sourceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Source removed
 */
router.delete("/products/:productId/knowledge/:sourceId", (req, res) =>
  knowledgeController.removeSource(req, res),
);

// Chat Routes

/**
 * @swagger
 * /api/chat/chat:
 *   post:
 *     summary: Send a chat message
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - message
 *             properties:
 *               productId:
 *                 type: string
 *               message:
 *                 type: string
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat response
 */
router.post("/chat", validate(chatRequestSchema), (req, res, next) =>
  chatController.processChat(req, res).catch(next),
);

/**
 * @swagger
 * /api/chat/messages/{sessionId}:
 *   get:
 *     summary: Get chat history
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat history
 */
router.get("/messages/:sessionId", (req, res) =>
  chatController.getMessages(req, res),
);

// Analytics Routes

/**
 * @swagger
 * /api/config/analytics/{productId}:
 *   get:
 *     summary: Get analytics for a product
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get("/analytics/:productId", (req, res) =>
  analyticsController.getAnalytics(req, res),
);

export default router;
