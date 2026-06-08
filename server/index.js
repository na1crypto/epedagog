/**
 * E-PEDAGOG Backend Server
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import DB initializer
import { initDatabase } from './db/index.js';

// Import Routes
import authRouter from './routes/auth.js';
import documentsRouter from './routes/documents.js';
import usersRouter from './routes/users.js';
import portfolioRouter from './routes/portfolio.js';
import monitoringRouter from './routes/monitoring.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database (automatically creates tables and seeds them)
initDatabase();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow loading local uploads from frontend
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Serve local uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Juda ko\'p so\'rov. 15 daqiqadan keyin qaytadan urinib ko\'ring.' },
});
app.use(limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/users', usersRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/monitoring', monitoringRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Server xatoligi yuz berdi' : err.message,
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  // 404 handler (dev only)
  app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint topilmadi' });
  });
}

app.listen(PORT, () => {
  console.log(`🎓 E-PEDAGOG Server ishga tushdi: http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});
