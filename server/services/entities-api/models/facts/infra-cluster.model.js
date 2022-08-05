import mongoose from 'mongoose';
const prefixSchema = 'facts';

const BtInfraClusterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true },
    dataCenterName: { type: String, required: true }
});

const BtInfraCluster = mongoose.model(`${prefixSchema}_bt_infra_cluster`, BtInfraClusterSchema);
export default BtInfraCluster;
