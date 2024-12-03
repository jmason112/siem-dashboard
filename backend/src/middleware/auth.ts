import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // For agent endpoints, verify with agent secret
    if (req.path.includes('/agent/')) {
      try {
        const agentSecret = process.env.AGENT_SECRET || 'default-secret';
        console.log('Using agent secret:', agentSecret); // Debug log
        console.log('Token:', token); // Debug log
        
        const decoded = jwt.verify(token, agentSecret);
        console.log('Decoded token:', decoded); // Debug log
        
        // Verify this is an agent token
        if (decoded && (decoded as any).type === 'agent') {
          req.user = decoded;
          return next();
        } else {
          return res.status(401).json({ error: 'Invalid agent token type' });
        }
      } catch (error) {
        console.error('Agent token verification failed:', error);
        return res.status(401).json({ error: 'Invalid agent token' });
      }
    }

    // For other endpoints, verify with JWT secret
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}; 