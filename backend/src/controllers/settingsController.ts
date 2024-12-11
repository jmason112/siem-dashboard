import { Request, Response } from 'express';
import { User } from '../models/User';
import { UserPreferences } from '../models/UserPreferences';
import { UserDevice } from '../models/UserDevice';
import { LoginHistory } from '../models/LoginHistory';

export const settingsController = {
  async getPreferences(req: Request, res: Response) {
    try {
      const preferences = await UserPreferences.findOne({ userId: req.user.userId });
      res.json(preferences || {});
    } catch (error) {
      console.error('Error fetching preferences:', error);
      res.status(500).json({ error: 'Failed to fetch preferences' });
    }
  },

  async updatePreferences(req: Request, res: Response) {
    try {
      const preferences = await UserPreferences.findOneAndUpdate(
        { userId: req.user.userId },
        { ...req.body },
        { new: true, upsert: true }
      );
      res.json(preferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
      res.status(500).json({ error: 'Failed to update preferences' });
    }
  },

  async getDevices(req: Request, res: Response) {
    try {
      const devices = await UserDevice.find({ userId: req.user.userId });
      res.json(devices);
    } catch (error) {
      console.error('Error fetching devices:', error);
      res.status(500).json({ error: 'Failed to fetch devices' });
    }
  },

  async removeDevice(req: Request, res: Response) {
    try {
      await UserDevice.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error removing device:', error);
      res.status(500).json({ error: 'Failed to remove device' });
    }
  },

  async getLoginHistory(req: Request, res: Response) {
    try {
      const history = await LoginHistory.find({ userId: req.user.userId })
        .sort({ timestamp: -1 })
        .limit(10);
      res.json(history);
    } catch (error) {
      console.error('Error fetching login history:', error);
      res.status(500).json({ error: 'Failed to fetch login history' });
    }
  }
}; 