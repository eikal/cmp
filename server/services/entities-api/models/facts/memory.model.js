import mongoose from 'mongoose';
const prefixSchema = 'facts';

const MemorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true }
});

const Memory = mongoose.model(`${prefixSchema}_memory`, MemorySchema);
export default Memory;
