import mongoose from 'mongoose';
const prefixSchema = 'facts';

const CpuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true }
});

const Cpu = mongoose.model(`${prefixSchema}_cpu`, CpuSchema);
export default Cpu;
