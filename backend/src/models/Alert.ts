import mongoose from 'mongoose';

export interface IAlert {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
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
    enum: ['low', 'medium', 'high', 'critical']
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