import mongoose from 'mongoose';

export interface IAlert {
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'new' | 'in_progress' | 'resolved' | 'dismissed';
  source: string;
  sourceIp?: string;
  timestamp: Date;
  tags: string[];
  affectedAssets: string[];
  assignedTo?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
}

const alertSchema = new mongoose.Schema<IAlert>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { 
    type: String, 
    required: true,
    enum: ['critical', 'warning', 'info']
  },
  status: {
    type: String,
    required: true,
    enum: ['new', 'in_progress', 'resolved', 'dismissed'],
    default: 'new'
  },
  source: { type: String, required: true },
  sourceIp: String,
  timestamp: { type: Date, default: Date.now },
  tags: [String],
  affectedAssets: [String],
  assignedTo: String,
  resolvedAt: Date,
  resolvedBy: String,
  resolution: String
}, {
  timestamps: true
});

// Indexes for better query performance
alertSchema.index({ severity: 1 });
alertSchema.index({ status: 1 });
alertSchema.index({ timestamp: -1 });
alertSchema.index({ source: 1 });

export const Alert = mongoose.model<IAlert>('Alert', alertSchema); 

// Function to create test alerts
export const createTestAlerts = async () => {
  const testAlerts = [
    {
      title: 'High CPU Usage',
      description: 'Server CPU usage exceeded 90%',
      severity: 'critical',
      source: 'System Monitor',
      sourceIp: '192.168.1.100',
      tags: ['performance', 'server'],
      affectedAssets: ['web-server-01']
    },
    {
      title: 'Failed Login Attempts',
      description: 'Multiple failed login attempts detected',
      severity: 'warning',
      source: 'Auth Service',
      sourceIp: '192.168.1.150',
      tags: ['security', 'authentication'],
      affectedAssets: ['auth-service']
    },
    {
      title: 'System Update Available',
      description: 'New security patches available',
      severity: 'info',
      source: 'Update Service',
      sourceIp: '192.168.1.200',
      tags: ['updates', 'security'],
      affectedAssets: ['all-systems']
    }
  ];

  try {
    await Alert.deleteMany({}); // Clear existing alerts
    await Alert.insertMany(testAlerts);
    console.log('Test alerts created successfully');
  } catch (error) {
    console.error('Error creating test alerts:', error);
  }
}; 