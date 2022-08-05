import mongoose from 'mongoose';

const TierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true },
    serverIDs: [{ type: String, required: true, default: [] }]
});

const Tier = mongoose.model('tier', TierSchema);
export default Tier;
