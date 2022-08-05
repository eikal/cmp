import { execSshCommand, getSshConnectionPrivateKey } from '../../../shared/ssh-client.js';
import ActionJob from '../models/action-job.model.js';
import Cloudspace from '../../entities-api/models/cloudspace/cloudspace.model.js';
import { executeStatusCheckByServer } from '../../status-check/helpers/helpers.js';
import { JOBS, JOBS_STATUS } from '../config/config.js';
import { getSshKeyByCloudspaceID } from '../../entities-api/helpers/configuration.js';
import { getCloudspaceRelations } from '../../entities-api/helpers/queries.js';

export const executeJob = async (cloudspaceID, serverAddress, serverID, job, jobLabelName, params, isShowOutput, createdBy) => {
    let docObj;
    let connection;
    try {
        let command = params;
        if (!params) {
            command = defineJob(job);
        }
        if (job === 'fileView') {
            command = defineJob(job) + ' ' + params;
        }
        docObj = await createNewJob(serverID, job, jobLabelName, command, isShowOutput, createdBy);
        const sshKeyExist = await getSshKeyByCloudspaceID(cloudspaceID);
        const sshKeyObject = {
            username: sshKeyExist?.username || process.env.CMP_ROOT_USER,
            keyPath: sshKeyExist?.keyPath || process.env.CMP_ROOT_KEY,
            keyPass: sshKeyExist?.keyPass || null
        };
        connection = await getSshConnectionPrivateKey(serverAddress, sshKeyObject.username, sshKeyObject.keyPath, sshKeyObject.keyPass);
        const promiseResult = await Promise.race([execSshCommandWithChunk(connection, command, null, docObj), timeoutFunc(1000 * 60 * 60, docObj.doc)]); // in a case of proccess run more than 60 min it will timeout
        const isKilled = await isJobKilled(docObj.doc);
        if (isKilled) {
            if (connection) await connection.dispose();
            return;
        }
        const updateDoc = await updateJobStatus(docObj.doc, promiseResult.stdout, promiseResult.stderr);
        if (jobLabelName.includes('Stop') || jobLabelName.includes('Restart') || jobLabelName.includes('Start') || jobLabelName.includes('Update')) {
            executeStatusCheckByServer(serverID);
        }
        if (connection) await connection.dispose();
        return updateDoc;
    } catch (ex) {
        const err = `executeJob -- Error while trying to execute job:${job} on server:${serverAddress}, Error: ${ex}`;
        console.error(err);
        if (connection) await connection.dispose();
        if (ex && ex.message && ex.message.includes('Timeout')) {
            await updateJobStatus(docObj.doc, null, null, true);
        } else {
            await updateJobStatus(docObj.doc, '', 'Action Failed');
        }
    }
};

const createNewJob = async (serverID, job, jobLabelName, jobCommand, isShowOutput, createdBy) => {
    try {
        const actionJob = new ActionJob({
            serverID: serverID,
            jobCommand: jobCommand,
            jobType: job,
            jobLabelName: jobLabelName,
            status: JOBS_STATUS.IN_PROGRESS,
            createdBy: createdBy,
            createdDate: new Date()
        });
        const isActionJobDocCreated = await actionJob.save(actionJob);
        if (isActionJobDocCreated?._doc) {
            console.log(`createNewJob -- Succeeded to create Action job:${job} for serverID:${serverID}`);
            return {
                doc: isActionJobDocCreated._doc,
                model: ActionJob
            };
        } else {
            throw `createNewJob -- Failed to create Action job:${job} for serverID:${serverID}`;
        }
    } catch (ex) {
        const err = `createNewJob -- Error while trying to create Action job:${job} for serverID:${serverID}}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

const updateJobStatus = async (jobObject, stdout, stderr, isTimedOut = false) => {
    try {
        let status = JOBS_STATUS.COMPLETED;
        if (stderr && !stdout) {
            status = JOBS_STATUS.FAILED;
        } else if (stderr && stdout) {
            status = JOBS_STATUS.COMPLETED_WITH_ERRORS;
        }
        const updatedObject = {
            status: status,
            updatedDate: new Date(),
            isTimedOut: isTimedOut
        };
        if (stderr) updatedObject.error = stderr;
        if (stdout) updatedObject.output = stdout;

        const isJobUpdated = await ActionJob.findByIdAndUpdate({ _id: jobObject._id }, updatedObject);
        await ActionJob.findByIdAndUpdate({ _id: jobObject._id }, updatedObject);
        if (isJobUpdated) {
            console.log(`updateJobStatus -- Succeeded to update ActionJob:${jobObject._id.toString()} for server:${jobObject.serverID} ,job:${jobObject.jobType}`);
            return {
                id: jobObject._id.toString(),
                createdBy: jobObject.createdBy,
                createdDate: jobObject.createdDate,
                error: stderr,
                output: stdout,
                status: status,
                jobLabelName: jobObject.jobLabelName,
                jobCommand: jobObject.jobCommand
            };
        } else {
            throw `updateJobStatus -- Failed to update ActionJob:${jobObject?._id?.toString()} for server:${jobObject.serverID} ,job:${jobObject.jobType}`;
        }
    } catch (ex) {
        const err = `updateJobStatus -- Error while trying to update job:${jobObject?._id?.toString()} on server:${jobObject.serverID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

/**
 * This method get command and execute this command on the target host
 * @param {Object} connection - ssh connection
 * @param {String} command - executable command
 * @param {String} cwd - execution path
 * @param {Object} docObject - doc object
 */
const execSshCommandWithChunk = async (connection, command, cwd, docObject) => {
    try {
        console.log(`execSshCommandWithChunk -- Trying to execute command: ${command}`);
        let storedData = '';
        let storedError = '';
        const result = await connection.execCommand(command, {
            cwd: cwd,
            onStdout: async (chunk) => {
                try {
                    const obj = await docObject.model.findById(docObject.doc._id.toString());
                    storedData = storedData + chunk.toString();
                    if (obj?._doc?.status === 'Killed') {
                        await docObject.model.updateOne({ _id: docObject.doc._id.toString() }, { status: 'Killed', updatedDate: new Date(), error: 'Action Aborted...\n' });
                        await connection.dispose();
                        return;
                    } else if (obj?._doc?.isTimedOut) {
                        await connection.dispose();
                        return;
                    } else {
                        if (obj?._doc?.status === 'In Progress') {
                            await docObject.model.updateOne({ _id: docObject.doc._id.toString() }, { status: 'In Progress', updatedDate: new Date(), output: storedData, error: null });
                        }
                    }
                } catch (ex) {
                    console.error(`execSshCommandWithChunk -- onStdout -- ${ex}`);
                    await connection.dispose();
                }
            },
            onStderr: async (chunk) => {
                try {
                    const obj = await docObject.model.findById(docObject.doc._id.toString());
                    storedError = storedError + chunk.toString();
                    if (obj?._doc?.status === 'Killed') {
                        storedError = storedError + 'Action Aborted...\n';
                        await docObject.model.updateOne({ _id: docObject.doc._id.toString() }, { status: 'Killed', updatedDate: new Date(), error: storedError });
                        await connection.dispose();
                        return;
                    } else if (obj?._doc?.isTimedOut) {
                        await connection.dispose();
                        return;
                    } else {
                        if (obj?._doc?.status === 'In Progress') {
                            await docObject.model.updateOne({ _id: docObject.doc._id.toString() }, { status: 'In Progress', updatedDate: new Date(), error: storedError });
                        }
                    }
                } catch (ex) {
                    console.error(`execSshCommandWithChunk -- onStderr -- ${ex}`);
                    await connection.dispose();
                }
            }
        });
        await connection.dispose();
        if (result.stderr) {
            console.error(`execSshCommandWithChunk -- Failed to execute command: ${command},Stderr:${result.stderr}`);
        }
        if (result.stdout || result.stdout === '') {
            console.log(`execSshCommandWithChunk -- Succeeded to execute command: ${command},Stdout:${result.stdout}`);
        }
        return ({ stdout: result.stdout, stderr: result.stderr });
    } catch (ex) {
        await connection.dispose();
        const err = `execSshCommandWithChunk -- Failed to execute command:${command},Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

const isJobKilled = async (jobObject) => {
    try {
        const job = await ActionJob.findById({ _id: jobObject._id });
        if (!job) {
            throw `${jobObject._id} not found`;
        }
        return job.status === JOBS_STATUS.KILLED;
    } catch (ex) {
        const err = `getJobStatus -- Error while trying to get job:${jobObject?._id?.toString()} , Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

const defineJob = (job) => {
    return JOBS[job];
};

export const execSsh = async (cloudspaceID, serverAddress, shell, params) => {
    try {
        let command = params;
        if (!params) {
            command = defineJob(shell);
        }
        const sshKeyExist = await getSshKeyByCloudspaceID(cloudspaceID);
        const sshKeyObject = {
            username: sshKeyExist?.username || process.env.CMP_ROOT_USER,
            keyPath: sshKeyExist?.keyPath || process.env.CMP_ROOT_KEY,
            keyPass: sshKeyExist?.keyPass || null
        };
        const connection = await getSshConnectionPrivateKey(serverAddress, sshKeyObject.username, sshKeyObject.keyPath, sshKeyObject.keyPass);
        const { stdout, stderr } = await execSshCommand(connection, command);
        return { stdout, stderr };
    } catch (ex) {
        const err = `execSsh -- Error while trying to exec:${shell} or ${params} on server:${serverAddress}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

const timeoutFunc = async (ms, jobObject) => {
    // eslint-disable-next-line no-useless-catch
    try {
        await new Promise(resolve => setTimeout(resolve, ms));
        const isKilled = await isJobKilled(jobObject);
        if (isKilled) {
            return;
        }
        throw 'Timeout after 5 min';
    } catch (ex) {
        throw new Error(ex);
    }
};

export const cleanAllInProgressActions = async () => {
    try {
        await ActionJob.updateMany({ status: JOBS_STATUS.IN_PROGRESS }, { status: JOBS_STATUS.KILLED, error: 'Abnormaly Aborted' });
    } catch (ex) {
        console.error(`cleanAllInProgressActions -- Error while trying to clean progress that stuck on progress mode,Ex:${ex.message}`);
    }
};

export const getJobsByCloudspaceID = async (cloudspaceID) => {
    try {
        const cloudspace = await Cloudspace.findById(cloudspaceID);
        if (!cloudspace) {
            throw `Cloudspace :${cloudspaceID} not found`;
        };
        const relations = await getCloudspaceRelations(cloudspace);
        const servers = [];
        const serverIDs = [];
        for (const project of relations.projects) {
            for (const tier of project.relations) {
                for (const server of tier.servers) {
                    serverIDs.push(server._doc._id.toString());
                    servers.push({
                        serverID: server._doc._id.toString(),
                        serverFullHostname: server._doc.fullHostname,
                        project: project.project._doc.name,
                        tier: tier.tier._doc.name
                    });
                }
            }
        }
        const actionJobs = await ActionJob.find({ serverID: { $in: serverIDs } }).sort({ _id: -1 }).limit(50);
        for (const actionJob of actionJobs) {
            const serverExist = servers.find((elm) => elm.serverID === actionJob._doc.serverID);
            if (!serverExist) continue;
            actionJob._doc.serverFullHostname = serverExist.serverFullHostname;
            actionJob._doc.project = serverExist.project;
            actionJob._doc.tier = serverExist.tier;
        }
        return actionJobs;
    } catch (ex) {
        const err = `getJobsByCloudspaceID -- Failed to get jobs by cloudspace:${cloudspaceID},Error:${ex}`;
        console.error(err);
        throw err;
    }
};
