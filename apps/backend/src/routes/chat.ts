import { Router } from "express";
import { ProductController } from "../controllers/product.js";
import { ChatController } from "../controllers/chat.js";
import { AnalyticsController } from "../controllers/analytics.js";
import { KnowledgeController } from "../controllers/knowledge.js";

const router = Router();
const productController = new ProductController();
const chatController = new ChatController();
const analyticsController = new AnalyticsController();
const knowledgeController = new KnowledgeController();

// Product Routes
router.get("/products", (req, res) => productController.getProducts(req, res));
router.get("/products/:productId", (req, res) =>
  productController.getProduct(req, res),
);
router.post("/config/:productId", (req, res) =>
  productController.upsertProduct(req, res),
);
router.patch("/products/:productId", (req, res) =>
  productController.updateProduct(req, res),
);
router.get("/products/:productId/sessions", (req, res) =>
  chatController.getSessions(req, res),
);

// Endpoints Routes
router.get("/products/:productId/endpoints", (req, res) =>
  productController.getEndpoints(req, res),
);
router.patch("/products/:productId/endpoints/:operationId", (req, res) =>
  productController.toggleEndpoint(req, res),
);

// Knowledge Routes
router.get("/products/:productId/knowledge", (req, res) =>
  knowledgeController.getSources(req, res),
);
router.post("/products/:productId/knowledge", (req, res) =>
  knowledgeController.addSource(req, res),
);
router.delete("/products/:productId/knowledge/:sourceId", (req, res) =>
  knowledgeController.removeSource(req, res),
);

// Chat Routes
router.post("/chat", (req, res) => chatController.processChat(req, res));
router.get("/messages/:sessionId", (req, res) =>
  chatController.getMessages(req, res),
);

// Analytics Routes
router.get("/analytics/:productId", (req, res) =>
  analyticsController.getAnalytics(req, res),
);

export default router;
