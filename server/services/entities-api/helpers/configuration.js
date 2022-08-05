import SshKey from '../models/configuration/ssh-key.model.js';
import mongoose from 'mongoose';
const { startSession } = mongoose;

export const updateSshKeyByCloudspaceID = async (cloudspaceID, username, keyPath, keyPass, createdBy) => {
    const session = await startSession();
    try {
        session.startTransaction();
        const updatedObject = {
            cloudspaceID,
            username,
            keyPath,
            keyPass: keyPass || null,
            createdBy
        };
        await SshKey.findOneAndUpdate({ cloudspaceID: cloudspaceID }, updatedObject, { new: true, upsert: true, session });
        console.log(`updateSshKeyByCloudspaceID -- Ssh key updated successfully for cloudspaceID:${cloudspaceID}`);
        await session.commitTransaction();
        session.endSession();
    } catch (ex) {
        await session.abortTransaction();
        session.endSession();
        const err = `updateSshKeyByCloudspaceID -- Error while trying to update ssh key on cloudspace:${cloudspaceID},Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const getSshKeyByCloudspaceID = async (cloudspaceID) => {
    try {
        const sshKeyObject = await SshKey.findOne({ cloudspaceID: cloudspaceID });
        return sshKeyObject;
    } catch (ex) {
        const err = `getSshKeyByCloudspaceID -- Error while trying to find ssh key on cloudspace:${cloudspaceID},Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const deleteSshKeyByCloudspaceID = async (cloudspaceID) => {
    const session = await startSession();
    try {
        session.startTransaction();
        const deletedKey = await SshKey.deleteOne({ cloudspaceID: cloudspaceID }, { session });
        if (!deletedKey || deletedKey?.deletedCount === 0) {
            throw 'Failed to delete key';
        }
        await session.commitTransaction();
        session.endSession();
        return;
    } catch (ex) {
        await session.abortTransaction();
        session.endSession();
        const err = `deleteSshKeyByCloudspaceID -- Error while trying to delete ssh key on cloudspace:${cloudspaceID},Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};
