import mongoose from 'mongoose';

const AgentSchema = new mongoose.Schema({
    agentId: {
        type: String,
        unique: true,
        required: true
    },
    name: String,
    status: {
        type: String,
        enum: ['running', 'stopped'],
        default: 'running'
    },
    deployedAt: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    systemInfo: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
}, {
    timestamps: true
});

export const Agent = mongoose.model('Agent', AgentSchema); 