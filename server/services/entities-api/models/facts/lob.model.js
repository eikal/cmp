import mongoose from 'mongoose';
const prefixSchema = 'facts';

const BtLobSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true }
});

const BtLob = mongoose.model(`${prefixSchema}_bt_lob`, BtLobSchema);

export default BtLob;
