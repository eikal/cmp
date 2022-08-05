import mongoose from 'mongoose';
const prefixSchema = 'facts';

const DatacenterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    secondName: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true }
});

const Datacenter = mongoose.model(`${prefixSchema}_datacenter`, DatacenterSchema);
export default Datacenter;
