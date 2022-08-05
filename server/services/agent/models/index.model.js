import mongoose from 'mongoose';

const AgentSchema = new mongoose.Schema({
    lastUpdatedDate: { type: Date, required: true }
});

const Agent = mongoose.model('agent', AgentSchema);
export default Agent;
