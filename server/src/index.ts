import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import animalRoutes from './routes/animals';
import reportRoutes from './routes/reports';
import caseRoutes from './routes/cases';
import mapRoutes from './routes/map';
import aiRoutes from './routes/ai';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'PashuMitra Express Surveillance API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/ai', aiRoutes);

// Central Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error]:', err.stack || err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🟢 PashuMitra Express API Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
