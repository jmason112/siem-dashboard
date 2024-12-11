import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'socket.io';
import alertRoutes from './routes/alertRoutes';
import securityRoutes from './routes/securityRoutes';
import agentRoutes from './routes/agentRoutes';
import { config } from './config/config';
import { logger } from './config/logger';
import { createTestAlerts, Alert } from './models/Alert';
import { Vulnerability } from './models/Vulnerability';
import { Compliance } from './models/Compliance';
import authRoutes from './routes/auth';

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
app.use('/api/agents', agentRoutes);
app.use('/api/auth', authRoutes);

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
    // Get userId from query parameter if not available in req.user
    const userId = req.user?.id || req.query.userId as string;

    if (!userId) {
      logger.error('No userId provided for agent alert');
      return res.status(400).json({ error: 'userId is required' });
    }

    const alertData = {
      ...req.body,
      userId: userId
    };
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

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  },
  path: '/socket.io'
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('Client connected to Socket.IO');

  socket.on('getVulnerabilities', async (filters) => {
    try {
      const query: any = {};
      
      if (filters?.severity?.[0] && filters.severity[0] !== 'all') {
        query.severity = filters.severity[0];
      }
      if (filters?.status?.[0] && filters.status[0] !== 'all') {
        query.status = filters.status[0];
      }

      const vulnerabilities = await Vulnerability.find(query)
        .sort({ cvss_score: -1 });

      socket.emit('vulnerabilities', vulnerabilities);
    } catch (error) {
      logger.error('Error fetching vulnerabilities:', error);
      socket.emit('error', { message: 'Error fetching vulnerabilities' });
    }
  });

  socket.on('getVulnerabilityStats', async () => {
    try {
      const total = await Vulnerability.countDocuments();
      
      const bySeverity = await Vulnerability.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]).then(results => 
        results.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {})
      );

      const byStatus = await Vulnerability.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).then(results => 
        results.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {})
      );

      socket.emit('vulnerabilityStats', {
        total,
        bySeverity,
        byStatus
      });
    } catch (error) {
      logger.error('Error fetching vulnerability stats:', error);
      socket.emit('error', { message: 'Error fetching vulnerability statistics' });
    }
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected from Socket.IO');
  });
});

// Add this near the top of your existing index.ts file
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/security-agent';

mongoose.connect(MONGODB_URI)
    .then(() => {
        logger.info('Connected to MongoDB');
    })
    .catch((error) => {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
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