import mongoose from 'mongoose';
const prefixSchema = 'facts';

const BtArtemisVersionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true }
});

const BtArtemisVersion = mongoose.model(`${prefixSchema}_bt_artemis_version`, BtArtemisVersionSchema);
export default BtArtemisVersion;
