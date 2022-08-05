import mongoose from 'mongoose';
const prefixSchema = 'facts';

const BtEnvSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true }
});

const BtEnv = mongoose.model(`${prefixSchema}_bt_env`, BtEnvSchema);
export default BtEnv;
