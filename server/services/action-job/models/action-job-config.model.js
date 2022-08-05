import mongoose from 'mongoose';
import { ACTION_JOB_CONFIG_TYPES } from '../config/config.js';

const ActionJobConfigSchema = new mongoose.Schema({
    projectID: { type: String, required: true },
    name: { type: String, required: true },
    displayName: { type: String, required: true },
    description: { type: String, required: false },
    isActive: { type: Boolean, required: false, default: true },
    bt_role: { type: [String], required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: false, default: null },
    createdBy: { type: String, required: true },
    actions: [{
        name: { type: String, required: true },
        displayName: { type: String, required: true },
        type: { type: String, enum: [ACTION_JOB_CONFIG_TYPES.SSH_COMMAND, ACTION_JOB_CONFIG_TYPES.FILE_VIEW] },
        value: [{ type: String, required: true }],
        isActive: { type: Boolean, required: true },
        roles: [{ type: String, required: true }],
        updatedDate: { type: Date, required: false, default: null },
        createdBy: { type: String, required: true },
        description: { type: String, required: false }
    }]
});

const ActionJobConfig = mongoose.model('action_job_config', ActionJobConfigSchema);
export default ActionJobConfig;
