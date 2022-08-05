import mongoose from 'mongoose';
const prefixSchema = 'facts';

const AdditionalDiskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true }
});

const AdditionalDisk = mongoose.model(`${prefixSchema}_additional_disk`, AdditionalDiskSchema);
export default AdditionalDisk;
