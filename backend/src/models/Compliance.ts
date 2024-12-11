import mongoose from 'mongoose';

export interface ICompliance {
  framework: 'ISO27001' | 'SOC2' | 'GDPR';
  control_id: string;
  control_name: string;
  description: string;
  status: 'compliant' | 'non_compliant' | 'partially_compliant';
  evidence: string;
  last_checked: Date;
  next_check: Date;
  risk_level: 'high' | 'medium' | 'low';
  remediation_plan?: string;
  comments?: string;
  attachments?: string[];
  tags: string[];
  hostname: string;
  userId: string;
}

const complianceSchema = new mongoose.Schema<ICompliance>({
  framework: { 
    type: String, 
    required: true,
    enum: ['ISO27001', 'SOC2', 'GDPR']
  },
  control_id: { type: String, required: true },
  control_name: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['compliant', 'non_compliant', 'partially_compliant'],
    default: 'non_compliant'
  },
  evidence: { type: String, required: true },
  last_checked: { type: Date, required: true },
  next_check: { type: Date, required: true },
  risk_level: {
    type: String,
    required: true,
    enum: ['high', 'medium', 'low']
  },
  remediation_plan: String,
  comments: String,
  attachments: [String],
  tags: [String],
  hostname: { type: String, required: true },
  userId: { type: String, required: true, index: true }
}, {
  timestamps: true
});

complianceSchema.index({ hostname: 1 });

export const Compliance = mongoose.model<ICompliance>('Compliance', complianceSchema, 'compliances'); 