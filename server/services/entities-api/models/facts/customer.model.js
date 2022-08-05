import mongoose from 'mongoose';
const prefixSchema = 'facts';

const BtCustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdDate: { type: Date, required: true },
    updatedDate: { type: Date, required: true }
});

const BtCustomer = mongoose.model(`${prefixSchema}_bt_customer`, BtCustomerSchema);
export default BtCustomer;
