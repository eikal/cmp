import mongoose from 'mongoose';

const K8sSchema = new mongoose.Schema({
    tierID: { type: String, required: true },
    createdBy: { type: String, required: true },
    createdDate: { type: Date, required: true },
    namespaces: [{ type: String, required: true, default: [] }]
});

const K8S = mongoose.model('k8s_config', K8sSchema);
export default K8S;
