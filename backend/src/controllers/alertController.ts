import { Request, Response } from 'express';
import { Alert, IAlert } from '../models/Alert';
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

      const query: any = {};

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

  // Create new alert
  async createAlert(req: Request, res: Response) {
    try {
      const alertData: IAlert = req.body;
      const alert = new Alert(alertData);
      await alert.save();
      
      // Broadcast to WebSocket clients
      // TODO: Implement WebSocket broadcast

      res.status(201).json(alert);
    } catch (error) {
      logger.error('Error creating alert:', error);
      res.status(500).json({ error: 'Error creating alert' });
    }
  },

  // Update alert status
  async updateAlert(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const alert = await Alert.findByIdAndUpdate(
        id,
        updateData,
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
      const { id } = req.params;
      const alert = await Alert.findByIdAndDelete(id);

      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }

      res.json({ message: 'Alert deleted successfully' });
    } catch (error) {
      logger.error('Error deleting alert:', error);
      res.status(500).json({ error: 'Error deleting alert' });
    }
  },

  // Get alert statistics
  async getAlertStats(req: Request, res: Response) {
    try {
      const stats = await Alert.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            bySeverity: {
              $push: {
                k: '$severity',
                v: 1
              }
            },
            byStatus: {
              $push: {
                k: '$status',
                v: 1
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            total: 1,
            bySeverity: { $arrayToObject: '$bySeverity' },
            byStatus: { $arrayToObject: '$byStatus' }
          }
        }
      ]);

      res.json(stats[0] || { total: 0, bySeverity: {}, byStatus: {} });
    } catch (error) {
      logger.error('Error fetching alert statistics:', error);
      res.status(500).json({ error: 'Error fetching alert statistics' });
    }
  }
}; 