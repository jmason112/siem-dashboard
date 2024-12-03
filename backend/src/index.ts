import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import alertRoutes from './routes/alertRoutes';
import securityRoutes from './routes/securityRoutes';
import { config } from './config/config';
import { logger } from './config/logger';
import { createTestAlerts, Alert } from './models/Alert';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ 
  server,
  path: '/ws'
});

// Keep track of connected clients
const clients = new Set<WebSocket>();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/alerts', alertRoutes);
app.use('/api/security', securityRoutes);

// Broadcast to all connected clients
export const broadcast = (data: any) => {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Agent alert endpoint
app.post('/api/agent/alert', async (req, res) => {
  try {
    const alertData = req.body;
    const alert = new Alert(alertData);
    await alert.save();
    
    // Broadcast new alert to all clients
    broadcast(alert);
    
    res.status(201).json(alert);
  } catch (error) {
    logger.error('Error processing agent alert:', error);
    res.status(500).json({ error: 'Error processing alert' });
  }
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  logger.info('Client connected to WebSocket');
  clients.add(ws);

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
    clients.delete(ws);
    logger.info('Client disconnected from WebSocket');
  });
});

// Connect to MongoDB
mongoose.connect(config.mongoUri)
  .then(async () => {
    logger.info('Connected to MongoDB at:', config.mongoUri);
    
    // Log the collections
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.collections();
      logger.info('Available collections:', collections.map(c => c.collectionName));
    }
    
    // Start server
    server.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
  }); 