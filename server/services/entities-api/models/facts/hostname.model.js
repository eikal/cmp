import mongoose from 'mongoose';
const prefixSchema = 'facts';

const HostnameSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dataCenterName: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true }
});

const Hostname = mongoose.model(`${prefixSchema}_hostname`, HostnameSchema);
export default Hostname;
