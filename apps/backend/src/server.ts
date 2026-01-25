import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.js';
import { Logger } from './utils/logger.js';

dotenv.config();

const logger = new Logger()

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    // origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
    origin: '*'
}));
app.use(express.json());

// Routes
app.use('/api', chatRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    logger.debug(`🚀 Backend running on http://localhost:${PORT}`)
});
