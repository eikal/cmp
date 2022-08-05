import mongoose from 'mongoose';

const ServerSchema = new mongoose.Schema({
    createdBy: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true },
    hostname: { type: String, required: true },
    fullHostname: { type: String, required: true },
    investigationCenterURL: { type: String, required: false },
    alias: { type: String, required: true },
    bt_lob: { type: String, required: true },
    bt_infra_cluster: { type: String, required: true },
    environment: { type: String, required: true },
    bt_role: { type: String, required: true },
    bt_customer: { type: String, required: true },
    bt_tier: { type: String, required: true },
    bt_env: { type: String, required: true },
    bt_infra_network: { type: String, required: true },
    bt_product: { type: String, required: true },
    hostgroup: { type: String, required: true },
    cpu: { type: String, required: true },
    memory: { type: String, required: true },
    os_version: { type: String, required: true },
    additional_disk: [{ type: String, required: true }],
    firewall_group: { type: String, required: true },
    ip_address: { type: String, required: true }
});

const Server = mongoose.model('server', ServerSchema);
export default Server;
