import joi from 'joi';
import { executeJob, execSsh, getJobsByCloudspaceID } from '../helpers/helpers.js';
import { limitBackups, saveAndBackup } from '../helpers/updateFile.js';
import { JOBS_STATUS } from '../config/config.js';
import HttpCodes from '../../../shared/http-status-codes.js';
import ActionJob from '../models/action-job.model.js';
import Server from '../../entities-api/models/server/server.model.js';

const executeJobs = async (req, res, next) => {
    try {
        console.log(`executeJobs -- User:${req.user} Trying to get execute job:${req.body.job}`);
        const schema = joi.object().keys({
            cloudspaceID: joi.string().required(),
            serverArray: joi.array().required().min(1),
            job: joi.string().required(),
            jobLabelName: joi.string().required(),
            params: joi.string().required().allow(null),
            isShowOutput: joi.boolean().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`executeJobs -- User:${req.user} Error while Trying to execute job: ${req.body.job},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const promises = [];
        for (const server of req.body.serverArray) {
            promises.push(executeJob(req.body.cloudspaceID, server.address, server.id, req.body.job, req.body.jobLabelName, req.body.params, req.body.isShowOutput, req.user));
        }
        Promise.allSettled(promises);
        return res.status(HttpCodes.OK).send({ data: req.body, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`executeJobs -- User:${req.user} Error while Trying to execute job: ${req.body.job},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

const getJobsByServerID = async (req, res, next) => {
    try {
        console.log(`getJobsByServerID -- User:${req.user} Trying to get jobs by serverID:${req.query.serverID}`);
        const schema = joi.object().keys({
            serverID: joi.string().required()
        });

        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`getJobsByServerID -- User:${req.user} Error whileTrying to get jobs by serverID:${req.query.serverID},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const jobs = await ActionJob.find({ serverID: req.query.serverID }).sort({ createdDate: -1 }).limit(30);
        console.log(`getJobsByServerID -- User:${req.user} Foud jobs:${jobs.length} by serverID:${req.query.serverID}`);
        return res.status(HttpCodes.OK).send({ data: jobs, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getJobsByServerID -- User:${req.user} Error while Trying to get jobs by serverID:${req.query.serverID},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

const retryJob = async (req, res, next) => {
    try {
        console.log(`retryJob -- User:${req.user} Trying to retry jobID:${req.body.jobID} by serverID:${req.body.serverID}`);
        const schema = joi.object().keys({
            cloudspaceID: joi.string().required(),
            serverID: joi.string().required(),
            jobID: joi.string().required(),
            params: joi.string().required().allow(null)
        });

        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`retryJob -- User:${req.user} Error while trying to retry jobID:${req.body.jobID} by serverID:${req.body.serverID},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const job = await ActionJob.findById(req.body.jobID);
        if (!job) {
            console.error(`retryJob -- User:${req.user} Error while trying to retry jobID:${req.body.jobID} by serverID:${req.body.serverID},Job not found`);
            return res.status(HttpCodes.NOT_FOUND).send({ data: null, statusCode: HttpCodes.NOT_FOUND, message: 'Job not found' });
        }
        const server = await Server.findById(req.body.serverID);
        if (!server) {
            console.error(`retryJob -- User:${req.user} Error while trying to retry jobID:${req.body.jobID} by serverID:${req.body.serverID},Server not found`);
            return res.status(HttpCodes.NOT_FOUND).send({ data: null, statusCode: HttpCodes.NOT_FOUND, message: 'Server not found' });
        }
        executeJob(req.body.cloudspaceID, server.fullHostname, req.body.serverID, job.jobType, job.jobLabelName, req.body.params, false, req.user);
        console.log(`retryJob -- User:${req.user} JobID:${req.body.jobID} by serverID:${req.body.serverID} executed again`);
        return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`retryJob -- User:${req.user} Error while Trying to retry JobID:${req.body.jobID} by serverID:${req.body.serverID},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

const killJobBtID = async (req, res, next) => {
    try {
        console.log(`killJobBtID -- User:${req.user} Trying to kill jobID:${req.body.jobID} by serverID:${req.body.serverID}`);
        const schema = joi.object().keys({
            jobID: joi.string().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`killJobBtID -- User:${req.user} Error while trying to kill jobID:${req.body.jobID} ,Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const job = await ActionJob.findById(req.body.jobID);
        if (!job) {
            console.error(`killJobBtID -- User:${req.user} Error while trying to kill jobID:${req.body.jobID} ,Job not found`);
            return res.status(HttpCodes.NOT_FOUND).send({ data: null, statusCode: HttpCodes.NOT_FOUND, message: 'Job not found' });
        }
        if (job.status !== JOBS_STATUS.IN_PROGRESS) {
            console.error(`killJobBtID -- User:${req.user} Error while trying to kill jobID:${req.body.jobID} ,Job Has been finished`);
            return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Job Has been finished' });
        }
        const newJobObject = job;
        newJobObject._doc.status = JOBS_STATUS.KILLED;
        newJobObject._doc.error = 'Action Aborted...';
        const jobIsUpdated = await ActionJob.findByIdAndUpdate(req.body.jobID, newJobObject, { upsert: false });
        if (!jobIsUpdated) {
            console.error(`killJobBtID -- User:${req.user} Error while trying to kill jobID:${req.body.jobID} by serverID:${newJobObject._doc.serverID},Job not updated`);
            return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Job not updated' });
        }

        console.log(`killJobBtID -- User:${req.user} JobID:${req.body.jobID} by serverID:${newJobObject._doc.serverID} killed`);
        return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`retryJob -- User:${req.user} Error while Trying to kill JobID:${req.body.jobID},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

const executeSsh = async (req, res, next) => {
    try {
        console.log(`executeSsh -- User:${req.user} Trying to call ssh command:${req.body.command}: ${req.body.params}`);
        const schema = joi.object().keys({
            cloudspaceID: joi.string().required(),
            server: joi.object().required(),
            command: joi.string().required().allow(''),
            params: joi.string().required().allow(null)
        });

        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`executeSsh -- User:${req.user} Error while Trying to call ssh command:${req.body.command}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const resultExecSsh = await execSsh(req.body.cloudspaceID, req.body.server.address, req.body.command, req.body.params);
        if (resultExecSsh.stderr) {
            throw resultExecSsh;
        }
        console.log(`executeSsh -- User:${req.user} command: ${req.body.params} executed sucssesfuly`);
        return res.status(HttpCodes.OK).send({ data: resultExecSsh, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`executeSsh -- User:${req.user} Error while Trying to execute command: ${req.body.params} on server:${req.body.server.address},Error:${JSON.stringify(ex)}`);
        let exMessage = null;
        if (ex && typeof ex === 'string' && ex.includes('getSshConnectionPrivateKey')) {
            exMessage = ex.split('Error:').pop();
        }
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: exMessage });
    }
};

const updateFile = async (req, res, next) => {
    try {
        console.log(`updateFile -- user ${req.user} trying update file ${req.body.filePath}${req.body.fileName} at server ${req.body.hostname}`);
        const schema = joi.object().keys({
            cloudspaceID: joi.string().required(),
            hostname: joi.string().required(),
            fileName: joi.string().required(),
            filePath: joi.string().required(),
            encodedData: joi.string().required()
        });
        const result = schema.validate(req.body);
        const { cloudspaceID, hostname, filePath, fileName } = req.body;
        if (result.error) {
            console.error(`updateFile -- User:${req.user} Validation error for file ${filePath}${fileName} at server ${hostname}: ${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const deletedBackup = await limitBackups(cloudspaceID, hostname, filePath, fileName);
        const newBackup = await saveAndBackup(cloudspaceID, hostname, filePath, fileName, req.body.encodedData);
        const data = { newBackup: newBackup, deletedBackup: deletedBackup };
        return res.status(HttpCodes.OK).send({ data: data, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`limitBackupFile -- User:${req.user} Error while Trying to delete file ${req.body.filePath}${req.body.fileName} at server ${req.body.hostname} ,Error: ${JSON.stringify(ex.message)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

const getJobs = async (req, res, next) => {
    try {
        console.log(`getJobs -- User:${req.user} Trying to get jobs by cloudspace:${req.query.cloudspaceID} fro dashboard`);
        const schema = joi.object().keys({
            cloudspaceID: joi.string().required()
        });

        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`getJobs -- User:${req.user} Error while Trying get jobs by cloudspace:${req.query.cloudspaceID} fro dashboard,Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const jobs = await getJobsByCloudspaceID(req.query.cloudspaceID);
        console.log(`getJobs -- User:${req.user} Foud jobs:${jobs.length} by serverID:${req.query.serverID}`);
        return res.status(HttpCodes.OK).send({ data: jobs, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getJobs -- User:${req.user} Error while Trying get jobs by cloudspace:${req.query.cloudspaceID} fro dashboard,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

const getFile = async (req, res, next) => {
    try {
        console.log(`getFile -- user ${req.user} trying update file ${req.body.filePath}${req.body.fileName} at server ${req.body.hostname}`);
        const schema = joi.object().keys({
            cloudspaceID: joi.string().required(),
            server: joi.object().required(),
            files: joi.array().required().min(1)
        });
        const result = schema.validate(req.body);
        const { cloudspaceID, server, files } = req.body;
        if (result.error) {
            console.error(`getFile -- User:${req.user} Validation error for get files for sever:${server.address},Error: ${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const promises = [];
        for (const file of files) {
            const command = `sudo find ${file} -type f -printf "\n%CD %CT %p" | sort -n -r`;
            promises.push(execSsh(cloudspaceID, server.address, 'fileView', command));
        }
        const promisesResult = await Promise.allSettled(promises);
        let data = [];
        for (const res of promisesResult) {
            if (res.value && res.value.stdout && !res.value.stderr) {
                const pathes = res.value.stdout.split('\n');
                data = [...data, ...pathes];
            }
        }
        return res.status(HttpCodes.OK).send({ data: data, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`limitBackupFile -- User:${req.user} Error while Trying to delete file ${req.body.filePath}${req.body.fileName} at server ${req.body.hostname} ,Error: ${JSON.stringify(ex.message)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

export default {
    executeJobs,
    getJobsByServerID,
    getJobs,
    retryJob,
    killJobBtID,
    executeSsh,
    updateFile,
    getFile
};
