import { Request, Response } from 'express';
import { Vulnerability } from '../models/Vulnerability';
import { Compliance } from '../models/Compliance';
import { logger } from '../config/logger';
import { broadcast } from '../index';

export const securityController = {
  // Vulnerability endpoints
  async getVulnerabilities(req: Request, res: Response) {
    try {
      const {
        severity,
        status,
        asset_id,
        search,
        page = 1,
        limit = 10
      } = req.query;

      const userId = req.user?.id || req.query.userId as string;

      if (!userId) {
        logger.error('No userId provided for vulnerability fetch');
        return res.status(400).json({ error: 'userId is required' });
      }

      const query: any = {
        userId: userId
      };
      
      // Add filters
      if (severity && severity !== 'all') query.severity = severity;
      if (status && status !== 'all') query.status = status;
      if (asset_id) query.asset_id = asset_id;
      
      // Add search functionality
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { asset_id: { $regex: search, $options: 'i' } }
        ];
      }

      logger.info('Fetching vulnerabilities with query:', query);

      const vulnerabilities = await Vulnerability.find(query)
        .sort({ cvss_score: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await Vulnerability.countDocuments(query);

      logger.info(`Found ${vulnerabilities.length} vulnerabilities out of ${total} total`);
      logger.debug('Vulnerabilities:', JSON.stringify(vulnerabilities, null, 2));

      res.json({
        vulnerabilities,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit))
      });
    } catch (error) {
      logger.error('Error fetching vulnerabilities:', error);
      res.status(500).json({ error: 'Error fetching vulnerabilities' });
    }
  },

  async updateVulnerabilityStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.id || req.query.userId as string;

      if (!userId) {
        logger.error('No userId provided for vulnerability status update');
        return res.status(400).json({ error: 'userId is required' });
      }

      const vulnerability = await Vulnerability.findOneAndUpdate(
        {
          _id: id,
          userId: userId
        },
        { status },
        { new: true }
      );

      if (!vulnerability) {
        return res.status(404).json({ error: 'Vulnerability not found' });
      }

      // Broadcast update to all clients
      broadcast({ type: 'vulnerability_update' });

      res.json(vulnerability);
    } catch (error) {
      logger.error('Error updating vulnerability status:', error);
      res.status(500).json({ error: 'Error updating vulnerability status' });
    }
  },

  async updateComplianceStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.id || req.query.userId as string;

      if (!userId) {
        logger.error('No userId provided for compliance status update');
        return res.status(400).json({ error: 'userId is required' });
      }

      const compliance = await Compliance.findOneAndUpdate(
        {
          _id: id,
          userId: userId
        },
        { status },
        { new: true }
      );

      if (!compliance) {
        return res.status(404).json({ error: 'Compliance record not found' });
      }

      // Broadcast update to all clients
      broadcast({ type: 'compliance_update' });

      res.json(compliance);
    } catch (error) {
      logger.error('Error updating compliance status:', error);
      res.status(500).json({ error: 'Error updating compliance status' });
    }
  },

  async getVulnerabilityStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id || req.query.userId as string;

      if (!userId) {
        logger.error('No userId provided for vulnerability stats');
        return res.status(400).json({ error: 'userId is required' });
      }

      const query = { userId: userId };
      const total = await Vulnerability.countDocuments(query);
      
      const bySeverity = await Vulnerability.aggregate([
        { $match: query },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]).then(results => 
        results.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {})
      );

      const byStatus = await Vulnerability.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).then(results => 
        results.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {})
      );

      const topAssets = await Vulnerability.aggregate([
        { $match: query },
        { $group: { 
          _id: '$asset_id',
          count: { $sum: 1 },
          critical: {
            $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
          }
        }},
        { $sort: { critical: -1, count: -1 } },
        { $limit: 5 }
      ]);

      res.json({
        total,
        bySeverity,
        byStatus,
        topAssets
      });
    } catch (error) {
      logger.error('Error fetching vulnerability stats:', error);
      res.status(500).json({ error: 'Error fetching vulnerability statistics' });
    }
  },

  // Compliance endpoints
  async getCompliance(req: Request, res: Response) {
    try {
      const {
        framework,
        status,
        risk_level,
        search,
        hostname,
        page = 1,
        limit = 10
      } = req.query;

      const userId = req.user?.id || req.query.userId as string;

      if (!userId) {
        logger.error('No userId provided for compliance fetch');
        return res.status(400).json({ error: 'userId is required' });
      }

      const query: any = {
        userId: userId
      };
      
      // Handle array parameters
      if (framework) query.framework = (framework as string).split(',');
      if (status) query.status = (status as string).split(',');
      if (risk_level) query.risk_level = (risk_level as string).split(',');
      if (hostname) query.hostname = hostname;
      
      // Simple search on control_name
      if (search) {
        query.control_name = new RegExp(search as string, 'i');
      }

      console.log('Search query:', query); // Debug log

      const compliance = await Compliance.find(query)
        .sort({ next_check: 1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await Compliance.countDocuments(query);

      res.json({
        compliance,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit))
      });
    } catch (error) {
      logger.error('Error fetching compliance data:', error);
      res.status(500).json({ error: 'Error fetching compliance data' });
    }
  },

  async getComplianceStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id || req.query.userId as string;

      if (!userId) {
        logger.error('No userId provided for compliance stats');
        return res.status(400).json({ error: 'userId is required' });
      }

      const query = { userId: userId };
      const byFramework = await Compliance.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$framework',
            total: { $sum: 1 },
            compliant: {
              $sum: { $cond: [{ $eq: ['$status', 'compliant'] }, 1, 0] }
            },
            partial: {
              $sum: { $cond: [{ $eq: ['$status', 'partially_compliant'] }, 1, 0] }
            },
            nonCompliant: {
              $sum: { $cond: [{ $eq: ['$status', 'non_compliant'] }, 1, 0] }
            }
          }
        }
      ]);

      const byRiskLevel = await Compliance.aggregate([
        { $match: query },
        { $group: { _id: '$risk_level', count: { $sum: 1 } } }
      ]).then(results => 
        results.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {})
      );

      const upcomingDeadlines = await Compliance.find({
        ...query,
        next_check: { $gte: new Date() },
        status: { $ne: 'compliant' }
      })
      .sort({ next_check: 1 })
      .limit(5);

      res.json({
        byFramework,
        byRiskLevel,
        upcomingDeadlines
      });
    } catch (error) {
      logger.error('Error fetching compliance stats:', error);
      res.status(500).json({ error: 'Error fetching compliance statistics' });
    }
  },

  // Agent endpoints
  async receiveVulnerabilityScan(req: Request, res: Response) {
    try {
      const scanResults = req.body;
      logger.info('Received vulnerability scan:', scanResults);
      
      const result = await Vulnerability.insertMany(scanResults.vulnerabilities);
      logger.info('Inserted vulnerabilities:', result);
      
      // Broadcast update to all connected clients
      broadcast({ type: 'vulnerability_update' });
      
      res.status(201).json({ message: 'Scan results received successfully' });
    } catch (error) {
      logger.error('Error processing vulnerability scan:', error);
      res.status(500).json({ error: 'Error processing scan results' });
    }
  },

  async receiveComplianceCheck(req: Request, res: Response) {
    try {
      const checkResults = req.body;
      logger.info('Received compliance check:', JSON.stringify(checkResults));
      
      if (!checkResults.compliance || !Array.isArray(checkResults.compliance)) {
        logger.error('Invalid compliance data format');
        return res.status(400).json({ error: 'Invalid compliance data format' });
      }

      // Update existing compliance records or create new ones
      const results = [];
      for (const result of checkResults.compliance) {
        try {
          // Ensure required fields are present
          if (!result.framework || !result.control_id || !result.hostname) {
            logger.error('Missing required fields in compliance check:', result);
            continue;
          }

          const complianceData = {
            ...result,
            userId: req.user.id,
            last_checked: new Date(result.last_checked),
            next_check: new Date(result.next_check),
            updated_at: new Date()
          };

          const updated = await Compliance.findOneAndUpdate(
            { 
              framework: result.framework, 
              control_id: result.control_id,
              hostname: result.hostname,
              userId: req.user.id
            },
            complianceData,
            { upsert: true, new: true }
          );
          results.push(updated);
        } catch (updateError) {
          logger.error('Error updating compliance record:', updateError);
          logger.error('Problematic record:', result);
        }
      }

      res.json({ success: true, results });
    } catch (error) {
      logger.error('Error processing compliance check:', error);
      res.status(500).json({ error: 'Error processing compliance check' });
    }
  }
}; 