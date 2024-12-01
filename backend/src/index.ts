import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import alertRoutes from './routes/alertRoutes';
import { config } from './config/config';
import { logger } from './config/logger';
import { createTestAlerts } from './models/Alert';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ 
  server,
  path: '/ws'
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/alerts', alertRoutes);

// WebSocket connection handling
wss.on('connection', (ws) => {
  logger.info('Client connected to WebSocket');

  // Send initial heartbeat
  ws.send(JSON.stringify({ type: 'heartbeat' }));

  // Set up heartbeat interval
  const heartbeat = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'heartbeat' }));
    }
  }, 30000);

  ws.on('error', (error) => {
    logger.error('WebSocket error:', error);
  });
  
  ws.on('close', () => {
    clearInterval(heartbeat);
    logger.info('Client disconnected from WebSocket');
  });
});

// Connect to MongoDB
mongoose.connect(config.mongoUri)
  .then(async () => {
    logger.info('Connected to MongoDB');
    
    // Create test alerts
    await createTestAlerts();
    
    // Start server
    server.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
  }); 