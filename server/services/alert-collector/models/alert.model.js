import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
    name: { type: String, required: true },
    summary: { type: String, required: true },
    server: { type: String, required: true },
    labels: { type: Object, required: true },
    annotations: { type: Object, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true },
    state: { type: String, required: true },
    lastState: { type: String, required: false },
    isAcknowledged: { type: Boolean, required: false, default: false },
    comments: [{
        reason: { type: String, required: true },
        createdBy: { type: String, required: true },
        updatedDate: { type: Date, required: true }
    }],
    required: false,
    default: []
});

AlertSchema.index({ server: 1 });
AlertSchema.index({ name: 1 });
AlertSchema.index({ createdDate: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 45 }); // expire after 45 days

const Alert = mongoose.model('alert_collector', AlertSchema);
export default Alert;
