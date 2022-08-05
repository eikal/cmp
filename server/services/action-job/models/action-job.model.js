import mongoose from 'mongoose';

const ActionJobSchema = new mongoose.Schema({
    serverID: { type: String, required: true },
    jobType: { type: String, required: true },
    jobLabelName: { type: String, required: true },
    jobCommand: { type: String, required: true },
    output: { type: String, required: false, default: null },
    error: { type: String, required: false, default: null },
    status: { type: String, required: true },
    isTimedOut: { type: Boolean, required: false },
    createdBy: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: false, default: null }
});

ActionJobSchema.index({ createdDate: 1 });

const ActionJob = mongoose.model('action_job', ActionJobSchema);
export default ActionJob;
