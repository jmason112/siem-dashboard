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
    osqueryData: {
        processes: [{
            type: {
                type: String,
                default: 'process'
            },
            timestamp: Date,
            data: {
                pid: Number,
                name: String,
                path: String,
                command: String,
                state: String,
                parent_pid: Number,
                user_id: String
            }
        }],
        network: [{
            type: {
                type: String,
                default: 'network_connection'
            },
            timestamp: Date,
            data: {
                process_name: String,
                process_path: String,
                local_port: Number,
                local_address: String,
                protocol: String
            }
        }],
        system: {
            type: {
                type: String,
                default: 'system_info'
            },
            timestamp: Date,
            data: {
                hostname: String,
                cpu: String,
                memory: Number,
                vendor: String,
                model: String,
                serial: String
            }
        }
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