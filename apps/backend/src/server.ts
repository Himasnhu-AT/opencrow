import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";
import { Logger } from "./utils/logger.js";
import { ENV_VALIDATE } from "./utils/env.validator.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";
import { AppError } from "./utils/AppError.js";
import { setupSwagger } from "./utils/swagger.js";

const logger = new Logger();

ENV_VALIDATE(logger);

const app = express();
const PORT = process.env.PORT || 3001;

// Setup Swagger
setupSwagger(app);

// Middleware
app.use(
  cors({
    origin: "*",
  }),
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.json());

// Public routes (no auth required)
app.use("/api/auth", authRoutes);

// Health check (public)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Other protected routes (JWT only)
// Note: Auth middleware should be applied inside chatRoutes or specifically here if needed
app.use("/api", chatRoutes);

// 404 Handler
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

app.listen(PORT, () => {
  logger.debug(`🚀 Backend running on http://localhost:${PORT}`);
});
