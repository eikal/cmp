import Server from '../../entities-api/models/server/server.model.js';
import { handleExistingServer } from '../../entities-api/helpers/foreman.js';
import { generateServerObject } from '../../entities-api/helpers/server-builder.js';
import mongoose from 'mongoose';
const { startSession } = mongoose;

/**
 * This method called according to cronjob config time.
 * This method execute update all servers facts from foreman.
 */
export const startSync = async () => {
    try {
        console.log(`startSync -- Start execute foreman update for all servers, Date:${new Date().toLocaleString()}`);
        const servers = await Server.find({});
        for (const server of servers) {
            await handleServer(server._doc);
        }
        console.log(`startSync -- Finish execute foreman update for all servers ,Date:${new Date().toLocaleString()}`);
    } catch (ex) {
        const err = `startSync -- Failed to start sync,Error:${ex}`;
        console.error(err);
    }
};

/**
 * This method execute status check
 * @param {Object} serverObject
 *
 */
export const handleServer = async (serverObject) => {
    const session = await startSession();
    try {
        session.startTransaction();
        console.log(`handleServer -- trying to update facts for server:${serverObject.fullHostname}`);
        const serverObj = { name: serverObject.fullHostname, id: serverObject.fullHostname };
        const serverObjectFacts = await handleExistingServer(serverObj, null, null, null, true);
        serverObjectFacts.updatedDate = new Date();
        serverObjectFacts.hostname = serverObject.hostname;
        const serverObjectFactsIDs = await generateServerObject(serverObjectFacts);
        const serverObjectIds = {};
        for (const key in serverObjectFactsIDs) {
            serverObjectIds[key] = serverObjectFactsIDs[key].id ? serverObjectFactsIDs[key].id : serverObjectFactsIDs[key];
        }
        await Server.findByIdAndUpdate(serverObject._id.toString(), serverObjectIds, { new: false, session });
        await session.commitTransaction();
        session.endSession();
        console.log(`handleServer -- succeeded to update facts for server:${serverObject.fullHostname}`);
    } catch (ex) {
        await session.abortTransaction();
        session.endSession();
        const err = `handleServer -- failed to update facts for server:${serverObject.fullHostname},Error:${ex}`;
        console.error(err);
    }
};
