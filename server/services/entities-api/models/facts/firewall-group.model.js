import mongoose from 'mongoose';
const prefixSchema = 'facts';

const FirewallGroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true },
    dataCenterName: { type: String, required: true },
    role: { type: String, required: true },
    env: { type: String, required: true }

});

const FirewallGroup = mongoose.model(`${prefixSchema}_firewall_group`, FirewallGroupSchema);
export default FirewallGroup;
