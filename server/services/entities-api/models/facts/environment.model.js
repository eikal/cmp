import mongoose from 'mongoose';
const prefixSchema = 'facts';

const BtEnvironmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true }
});

const Environment = mongoose.model(`${prefixSchema}_environment`, BtEnvironmentSchema);
export default Environment;
