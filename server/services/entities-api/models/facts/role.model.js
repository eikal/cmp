
import mongoose from 'mongoose';
const prefixSchema = 'facts';

const BtRoleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true },
    artemisVersion: { type: String, required: true }
});

const BtRole = mongoose.model(`${prefixSchema}_bt_role`, BtRoleSchema);
export default BtRole;
