import mongoose from 'mongoose';
const prefixSchema = 'facts';

const OsVersionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true }
});

const OsVersion = mongoose.model(`${prefixSchema}_os_version`, OsVersionSchema);
export default OsVersion;
