import mongoose from 'mongoose';
const prefixSchema = 'facts';

const BtInfraNetworkSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true },
    dataCenterName: { type: String, required: true },
    btTierName: { type: String, required: true }
});

const BtInfraNetwork = mongoose.model(`${prefixSchema}_bt_infra_network`, BtInfraNetworkSchema);
export default BtInfraNetwork;
