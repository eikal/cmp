import mongoose from 'mongoose';
const prefixSchema = 'facts';

const BtProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true }
});

const BtProduct = mongoose.model(`${prefixSchema}_bt_product`, BtProductSchema);
export default BtProduct;
