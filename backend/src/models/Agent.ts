import mongoose from 'mongoose';

const AgentSchema = new mongoose.Schema({
    agentId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
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
    },
    userId: {
        type: String,
        required: true,
        index: true
    }
}, {
    timestamps: true
});

// Remove the default _id index
AgentSchema.set('id', false);

// Create a compound index for userId and agentId
AgentSchema.index({ userId: 1, agentId: 1 }, { unique: true });

export const Agent = mongoose.model('Agent', AgentSchema); 