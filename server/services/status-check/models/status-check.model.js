import mongoose from 'mongoose';

const StatusCheckSchema = new mongoose.Schema({
    serverID: { type: String, required: true },
    system: {
        status: { type: String, required: true },
        message: { type: String, required: false }
    },
    network: {
        status: { type: String, required: true },
        message: { type: String, required: false }
    },
    puppet: {
        status: {
            status: { type: String, required: true },
            message: { type: String, required: false }
        },
        configuration: {
            status: { type: String, required: true },
            message: { type: String, required: false }
        },
        agent: {
            status: { type: String, required: true },
            message: { type: String, required: false }
        }
    },
    monitoring: {
        infrastructure: {
            status: { type: String, required: true },
            message: { type: String, required: false }
        },
        app: {
            status: { type: String, required: false },
            message: { type: String, required: false }
        }
    },
    cfrm: {
        service: {
            status: { type: String, required: false },
            message: { type: String, required: false }
        },
        app: {
            status: { type: String, required: false },
            message: { type: String, required: false }
        }
    },
    elk: {
        app: {
            status: { type: String, required: false },
            message: { type: String, required: false }
        },
        cluster: {
            status: { type: String, required: false },
            message: { type: String, required: false }
        },
        apacheds: {
            status: { type: String, required: false },
            message: { type: String, required: false }
        },
        artemis: {
            status: { type: String, required: false },
            message: { type: String, required: false }
        }
    },
    db: {
        network: {
            status: { type: String, required: false },
            message: { type: String, required: false }
        },
        exporter: {
            status: { type: String, required: false },
            message: { type: String, required: false }
        }
    },
    nfsMount: {
        status: { type: String, required: false },
        message: { type: String, required: false }
    },
    createdDate: { type: Date, required: true },
    generalStatus: { type: String, required: true }
});

StatusCheckSchema.index({ createdDate: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 }); // expire after 7 days

const StatusCheck = mongoose.model('status_check', StatusCheckSchema);
export default StatusCheck;
