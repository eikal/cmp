
import joi from 'joi';
import Server from '../../models/server/server.model.js';
import Tier from '../../models/tier/tier.model.js';
import Cloudspace from '../../models/cloudspace/cloudspace.model.js';
import Project from '../../models/project/project.model.js';
import { generateServerObject, createFullHostname, createInvestigationURL } from '../../helpers/server-builder.js';
import { getServerReleations, deleteServerRelation } from '../../helpers/queries.js';
import HttpCodes from '../../../../shared/http-status-codes.js';
import mongoose from 'mongoose';
const { startSession } = mongoose;

const createServer = async (req, res, next) => {
    try {
        console.log(`createServer -- User:${req.user} Trying to create new Server:${req.body.hostname}`);
        const schema = joi.object().keys({
            hostname: joi.string().required(),
            alias: joi.string().required().allow('NA'),
            bt_lob: joi.string().required().allow('NA'),
            bt_infra_cluster: joi.string().required().allow('NA'),
            environment: joi.string().required(),
            bt_role: joi.string().required().allow('NA'),
            bt_customer: joi.string().required().allow('NA'),
            bt_tier: joi.string().required().allow('NA'),
            bt_env: joi.string().required().allow('NA'),
            bt_infra_network: joi.string().required().allow('NA'),
            bt_product: joi.string().required().allow('NA'),
            hostgroup: joi.string().required(),
            cpu: joi.string().required(),
            memory: joi.string().required(),
            os_version: joi.string().required(),
            additional_disk: joi.array().required().allow('NA'),
            firewall_group: joi.string().required().allow('NA'),
            tierID: joi.string().required(),
            dataCenter: joi.string().required(),
            ip_address: joi.string(),
            createdBy: joi.string(),
            'x-access-token': joi.string()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`createServer -- User:${req.user} Error while trying to create new Server:${req.body.hostname},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        delete req.body['x-access-token'];
        req.body.createdBy = req.user || req.body.createdBy;
        req.body.createdDate = new Date();
        req.body.updatedDate = new Date();
        const fullHostname = createFullHostname(req.body.hostname);
        req.body.fullHostname = fullHostname;
        if (req.body.bt_product.includes('cfrm') && ['cfrm', 'app', 'frontend', 'backend'].includes(req.body.bt_role)) {
            req.body.investigationCenterURL = createInvestigationURL(fullHostname);
        }
        const serverObject = await generateServerObject(req.body);
        const serverObjectIds = {};
        const serverObjectNames = {};
        for (const key in serverObject) {
            serverObjectIds[key] = serverObject[key].id ? serverObject[key].id : serverObject[key];
            serverObjectNames[key] = serverObject[key].name ? serverObject[key].name : serverObject[key];
        }
        delete serverObjectIds.tierID;
        const server = new Server(serverObjectIds);
        const isServerDocCreated = await server.save(server);
        if (!isServerDocCreated?._doc) {
            console.error(`createServer -- User:${req.user} Error while trying to create new Server:${req.body.hostname}`);
            return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Server creation failed' });
        }
        console.log(`createServer -- User:${req.user} Trying to relate new server:${req.body.hostname} to his tier:${req.body.tierID}`);
        const tierUpdated = await Tier.findByIdAndUpdate(req.body.tierID, { $addToSet: { serverIDs: isServerDocCreated._doc._id.toString() } });
        if (!tierUpdated) {
            console.error(`Failed to relate new server:${req.body.hostname} to his tier:${req.body.tierID}`);
            return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Server creation failed' });
        }
        console.log(`createServer -- User:${req.user} Succeeded to create new Server:${req.body.hostname}`);
        serverObjectNames._id = isServerDocCreated._id;
        return res.status(HttpCodes.OK).send({ data: serverObjectNames, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`createServer -- User:${req.user} Error while trying to create new Server:${req.body.hostname},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Server creation failed' });
    }
};

const updateServerByID = async (req, res, next) => {
    try {
        console.log(`updateServerByID -- User:${req.user} Trying to update Server:${req.params.id}`);
        const schema = joi.object().keys({
            investigationCenterURL: joi.string()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`updateServerByID -- User:${req.user} Error while trying to update Server:${req.params.id},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const isServerUpdated = await Server.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (isServerUpdated) {
            console.log(`updateServerByID -- User:${req.user} Succeeded to update Server:${req.params.id}`);
            const serverDetails = await getServerReleations(isServerUpdated);
            return res.status(HttpCodes.OK).send({ data: serverDetails, statusCode: HttpCodes.OK, message: null });
        } else {
            throw `Failed to update server :${req.params.id} details`;
        }
    } catch (ex) {
        console.error(`updateServerByID -- User:${req.user} Error while trying to update Server:${req.params.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Server update failed' });
    }
};

const changeServerTierByID = async (req, res, next) => {
    const session = await startSession();
    try {
        console.log(`changeServerTierByID -- User:${req.user} Trying to update Server:${req.body.serverID} tier to:${req.body.tierID}`);
        const schema = joi.object().keys({
            serverID: joi.string().required(),
            tierID: joi.string().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            session.endSession();
            console.error(`changeServerTierByID -- User:${req.user} Error while Trying to update Server:${req.body.serverID} tier to:${req.body.tierID},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        session.startTransaction();
        const isServerPulled = await Tier.findOneAndUpdate({ serverIDs: { $in: req.body.serverID } }, { $pull: { serverIDs: req.body.serverID } }, { session });
        if (!isServerPulled) {
            throw `changeServerTierByID -- User:${req.user} Failed to pull serverID:${req.body.serverID}`;
        }
        const tierUpdated = await Tier.findByIdAndUpdate(req.body.tierID, { $addToSet: { serverIDs: req.body.serverID } });
        if (!tierUpdated) {
            throw `changeServerTierByID -- User:${req.user} Failed to push serverID:${req.body.serverID} to tierID:${req.body.tierID}`;
        }
        await session.commitTransaction();
        session.endSession();
        console.log(`changeServerTierByID -- User:${req.user} Succeeded to update Server:${req.body.serverID} tier to:${req.body.tierID}`);
        return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        await session.abortTransaction();
        session.endSession();
        console.error(`updateServerByID -- User:${req.user} Error while trying to update Server:${req.body.serverID},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Server update failed' });
    }
};

const getAllServersByCloudspace = async (req, res, next) => {
    try {
        console.log(`getAllServersByCloudspace -- User:${req.user} Trying to get all Servers`);
        const schema = joi.object().keys({
            cloudspace: joi.string().required()
        });
        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`getAllServersByCloudspace -- User:${req.user} Trying to get servers for cloudspace,Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const isCloudspaceIsFound = await Cloudspace.findById(req.query.cloudspace);
        if (!isCloudspaceIsFound) {
            throw `getAllServersByCloudspace -- User:${req.user} Faild to find cloudspace:${req.query.cloudspace}`;
        }
        const isProjectsFound = await Project.find({ _id: { $in: isCloudspaceIsFound._doc.projectIDs } });
        if (!isProjectsFound) {
            throw `getAllServersByCloudspace -- User:${req.user} Faild to find projects in cloudspace:${req.query.cloudspace}`;
        }
        const tierIDs = [];
        for (const project of isProjectsFound) {
            for (const tierID of project._doc.tierIDs) {
                tierIDs.push(tierID);
            }
        }
        const foundTiers = await Tier.find({ _id: { $in: tierIDs } });
        const serverIDs = [];
        for (const tier of foundTiers) {
            for (const serverID of tier._doc.serverIDs) {
                serverIDs.push(serverID);
            }
        }
        const foundServers = await Server.find({ _id: { $in: serverIDs } });
        if (!foundServers || foundServers.length === 0) {
            return res.status(HttpCodes.OK).send({ data: [], statusCode: HttpCodes.OK, message: null });
        }
        const promises = [];
        for (const server of foundServers) {
            promises.push(getServerReleations(server));
        }
        const promisesResult = await Promise.all(promises);
        console.log(`getAllServersByCloudspace -- User:${req.user} Found :${promisesResult.length} Servers`);
        return res.status(HttpCodes.OK).send({ data: promisesResult, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getAllServersByCloudspace -- User:${req.user} Error while trying  to get all Servers,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Failed to get server ${req.body.id}` });
    }
};

const getAllServers = async (req, res, next) => {
    try {
        console.log(`getAllServers -- User:${req.user} Trying to get all Servers`);
        const foundServers = await Server.find({}).select('-createdBy');
        if (!foundServers || foundServers.length === 0) {
            return res.status(HttpCodes.OK).send({ data: [], statusCode: HttpCodes.OK, message: null });
        }
        console.log(`getAllServersByCloudspace -- User:${req.user} Found :${foundServers.length} Servers`);
        return res.status(HttpCodes.OK).send({ data: foundServers, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getAllServersByCloudspace -- User:${req.user} Error while trying  to get all Servers,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Failed to get server ${req.body.id}` });
    }
};

const getServerByID = async (req, res, next) => {
    try {
        console.log(`getServerByID -- User:${req.user} Trying to get Server:${req.params.id}`);
        const isServerFound = await Server.findById(req.params.id);
        if (!isServerFound) {
            console.error(`getServerByID -- User:${req.user} Error while trying to get Server:${req.params.id}`);
            return res.status(HttpCodes.NOT_FOUND).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Server:${req.params.id} not found` });
        }
        const server = await getServerReleations(isServerFound);
        console.log(`getServerByID -- User:${req.user} Succeeded to get Server:${req.params.id}`);
        return res.status(HttpCodes.OK).send({ data: server, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getServerByID -- User:${req.user} Error while trying to get Server:${req.params.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Failed to get Server ${req.params.id}` });
    }
};

const deleteServers = async (req, res, next) => {
    const session = await startSession();
    try {
        console.log(`deleteServers -- User:${req.user} Trying to delete Servers`);
        const serverSchema = joi.object().keys({
            id: joi.string().required(),
            tierId: joi.string().required()
        });
        const schema = joi.array().items(serverSchema);
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`deleteServers -- User:${req.user} Error while trying to create existing servers,Error:${result.error}`);
            session.endSession();
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        session.startTransaction();
        for (const server of req.body) {
            await deleteServerRelation(server.id, server.tierId, session);
        }
        await session.commitTransaction();
        session.endSession();
        return res.status(HttpCodes.OK).send({ data: req.body, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        await session.abortTransaction();
        session.endSession();
        console.error(`deleteServerByID -- User:${req.user} Error while trying to delete server:${req.body.serverArray},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Failed to delete server ${req.params.id}` });
    }
};

export default {
    createServer,
    getAllServersByCloudspace,
    getAllServers,
    updateServerByID,
    getServerByID,
    deleteServers,
    changeServerTierByID
};
