import mongoose from 'mongoose';

const SourceSyncSchema = new mongoose.Schema({
    lastUpdatedDate: { type: Date, required: true }
});

const SourceSync = mongoose.model('source_sync', SourceSyncSchema);
export default SourceSync;
