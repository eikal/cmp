import mongoose from 'mongoose';

const CloudspaceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: String, required: true },
    createdDate: { type: Date, required: true, default: new Date() },
    updatedDate: { type: Date, required: true, default: new Date() },
    projectIDs: [{ type: String, required: true, default: [] }]
});

const Cloudspace = mongoose.model('cloudspace', CloudspaceSchema);
export default Cloudspace;
