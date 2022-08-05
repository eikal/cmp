import mongoose from 'mongoose';
const prefixSchema = 'facts';

const BtTierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true }
});

const BtTier = mongoose.model(`${prefixSchema}_bt_tier`, BtTierSchema);
export default BtTier;
