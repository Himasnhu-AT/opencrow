import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat.js';
import authRoutes from './routes/auth.js';
import { authMiddleware, chatAuthMiddleware } from './middleware/auth.js';
import { Logger } from './utils/logger.js';
import { ENV_VALIDATE } from './utils/env.validator.js';

const logger = new Logger()

ENV_VALIDATE(logger)

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    // origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
    origin: '*'
}));
app.use(express.json());

// Public routes (no auth required)
app.use('/api/auth', authRoutes);

// Health check (public)
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// // Chat routes (allow both JWT and API key)
// app.use('/api/chat', chatAuthMiddleware);
// app.use('/api/messages', chatAuthMiddleware);

// Other protected routes (JWT only)
app.use('/api', chatRoutes);

app.listen(PORT, () => {
    logger.debug(`🚀 Backend running on http://localhost:${PORT}`)
});
