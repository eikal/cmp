import mongoose from 'mongoose';
const prefixSchema = 'facts';

const HostgroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true }
});

const Hostgroup = mongoose.model(`${prefixSchema}_hostgroup`, HostgroupSchema);
export default Hostgroup;
