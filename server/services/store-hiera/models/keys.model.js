import mongoose from 'mongoose';

const keysSchema = new mongoose.Schema({
    key: { type: String, required: true },
    encryptKey: { type: String, required: true },
    updatedDate: { type: Date, required: true }
});

const Key = mongoose.model('Key_Hiera', keysSchema);
export default Key;
