import { Request, Response } from 'express';
import { Alert } from '../models/Alert';
import { logger } from '../config/logger';

export const alertController = {
  // Get all alerts with filtering and pagination
  async getAlerts(req: Request, res: Response) {
    try {
      const {
        severity,
        status,
        startDate,
        endDate,
        page = 1,
        limit = 10
      } = req.query;

      const userId = req.user?.id || req.query.userId as string;

      if (!userId) {
        logger.error('No userId provided for alerts fetch');
        return res.status(400).json({ error: 'userId is required' });
      }

      const query: any = {
        userId: userId
      };

      if (severity) query.severity = severity;
      if (status) query.status = status;
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate as string);
        if (endDate) query.timestamp.$lte = new Date(endDate as string);
      }

      const alerts = await Alert.find(query)
        .sort({ timestamp: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await Alert.countDocuments(query);

      res.json({
        alerts,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit))
      });
    } catch (error) {
      logger.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Error fetching alerts' });
    }
  },

  // Get alert statistics
  async getStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id || req.query.userId as string;

      if (!userId) {
        logger.error('No userId provided for alert stats');
        return res.status(400).json({ error: 'userId is required' });
      }

      const query = { userId: userId };
      const total = await Alert.countDocuments(query);
      
      const bySeverity = await Alert.aggregate([
        { $match: query },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]).then(results => 
        results.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {})
      );

      const byStatus = await Alert.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).then(results => 
        results.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {})
      );

      res.json({
        total,
        bySeverity,
        byStatus
      });
    } catch (error) {
      logger.error('Error fetching alert stats:', error);
      res.status(500).json({ error: 'Error fetching alert statistics' });
    }
  },

  // Create new alert
  async createAlert(req: Request, res: Response) {
    try {
      const userId = req.user?.id || req.query.userId as string;

      if (!userId) {
        logger.error('No userId provided for alert creation');
        return res.status(400).json({ error: 'userId is required' });
      }

      const alertData = {
        ...req.body,
        userId: userId
      };
      const alert = new Alert(alertData);
      await alert.save();
      res.status(201).json(alert);
    } catch (error) {
      logger.error('Error creating alert:', error);
      res.status(500).json({ error: 'Error creating alert' });
    }
  },

  // Update alert
  async updateAlert(req: Request, res: Response) {
    try {
      const userId = req.user?.id || req.query.userId as string;

      if (!userId) {
        logger.error('No userId provided for alert update');
        return res.status(400).json({ error: 'userId is required' });
      }

      const alert = await Alert.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: userId
        },
        req.body,
        { new: true }
      );
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      res.json(alert);
    } catch (error) {
      logger.error('Error updating alert:', error);
      res.status(500).json({ error: 'Error updating alert' });
    }
  },

  // Delete alert
  async deleteAlert(req: Request, res: Response) {
    try {
      const userId = req.user?.id || req.query.userId as string;

      if (!userId) {
        logger.error('No userId provided for alert deletion');
        return res.status(400).json({ error: 'userId is required' });
      }

      const alert = await Alert.findOneAndDelete({
        _id: req.params.id,
        userId: userId
      });
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      res.json({ message: 'Alert deleted successfully' });
    } catch (error) {
      logger.error('Error deleting alert:', error);
      res.status(500).json({ error: 'Error deleting alert' });
    }
  }
}; 