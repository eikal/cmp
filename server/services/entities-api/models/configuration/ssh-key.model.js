import mongoose from 'mongoose';

const SshKeySchema = new mongoose.Schema({
    cloudspaceID: { type: String, required: true },
    username: { type: String, required: true },
    keyPath: { type: String, required: true },
    keyPass: { type: String, required: false },
    createdBy: { type: String, required: true },
    createdDate: { type: Date, required: true, default: new Date() },
    updatedDate: { type: Date, required: true, default: new Date() }
});

const SshKey = mongoose.model('ssh-key', SshKeySchema);
export default SshKey;
