import Cloudspace from '../models/cloudspace/cloudspace.model.js';
import Project from '../models/project/project.model.js';
import Tier from '../models/tier/tier.model.js';
import Server from '../models/server/server.model.js';
import Tenant from '../models/tenant/tenant.model.js';
import Facts from '../config/facts.js';
import StatusCheck from '../../status-check/models/status-check.model.js';
import ActionJob from '../../action-job/models/action-job.model.js';
import ActionJobConfig from '../../action-job/models/action-job-config.model.js';
import AlertCollector from '../../alert-collector/models/alert.model.js';
import Role from '../../auth/models/role.model.js';
import K8S from '../../k8s/models/k8s.model.js';
import SshKey from '../models/configuration/ssh-key.model.js';
import { getModalByFactType } from './validations.js';
import { getUsernameGroupsMemmbership } from '../../auth/integrations/active-directory.js';

export const getCloudspaceRelations = async (cloudspace) => {
    try {
        const promises = [];
        for (const projectID of cloudspace.projectIDs) {
            promises.push(getProjectReleations(projectID));
        }
        const projects = await Promise.all(promises);
        const result = { projects, cloudspace };
        return result;
    } catch (ex) {
        const err = `getCloudspaceRelations -- Error while trying to get all relations for cloudspace:${cloudspace.name} ,Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const getCloudspacesBySpecUser = async (username, role) => {
    try {
        if (role === 'superAdmin') {
            const cloudspaces = await Cloudspace.find({});
            return cloudspaces;
        }
        const cloudspaceIDs = new Set();
        const roles = await Role.find({
            $or: [
                { 'admin.users': { $in: new RegExp(username, 'i') } },
                { 'advanced.users': { $in: new RegExp(username, 'i') } },
                { 'basic.users': { $in: new RegExp(username, 'i') } }
            ]
        });
        if (roles && roles.length > 0) {
            for (const role of roles) {
                cloudspaceIDs.add(role.cloudspaceID);
            }
        }
        const userGroups = await getUsernameGroupsMemmbership(username);
        for (const userGroup of userGroups) {
            const roles = await Role.find({
                $or: [
                    { 'admin.groups': { $in: new RegExp(userGroup, 'i') } },
                    { 'advanced.groups': { $in: new RegExp(userGroup, 'i') } },
                    { 'basic.groups': { $in: new RegExp(userGroup, 'i') } }
                ]
            });
            if (roles && roles.length > 0) {
                for (const role of roles) {
                    cloudspaceIDs.add(role.cloudspaceID);
                }
            }
        }
        const cloudSpaceIDsArray = [...cloudspaceIDs];
        const cloudspaces = await Cloudspace.find({ _id: { $in: cloudSpaceIDsArray } });
        return cloudspaces;
    } catch (ex) {
        const err = `getCloudspacesBySpecUser -- Error while trying to get cloudspaces for user:${username} ,Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const getProjectReleations = async (projectID) => {
    try {
        const isProjectFound = await Project.findById(projectID);
        if (!isProjectFound) {
            throw `getProjectReleations -- Project:${projectID} not found`;
        }
        isProjectFound._doc.domain = process.env.LDAP_DOMAIN;
        if (isProjectFound._doc.tierIDs.length === 0) {
            return {
                project: isProjectFound._doc,
                relations: [
                    {
                        tier: null,
                        servers: []
                    }
                ]
            };
        }
        const promises = [];
        for (const tierID of isProjectFound._doc.tierIDs) {
            promises.push(getRelatedServersByTierID(tierID));
        }
        const response = await Promise.all(promises);
        return {
            project: isProjectFound,
            relations: response
        };
    } catch (ex) {
        const err = `getProjectReleations -- Error while trying to get projects relations for project ID:${projectID}, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

export const getTierReleations = async (tierID) => {
    try {
        const tierDetails = await getRelatedServersByTierID(tierID);
        const project = await Project.findOne({ tierIDs: { $in: tierID } });
        if (!project) {
            throw `getTierReleations -- Tier ID:${tierID} has not have related to project`;
        }
        tierDetails.project = {
            name: project._doc.name,
            id: project._doc._id.toString(),
            solution: project._doc.solution
        };
        return tierDetails;
    } catch (ex) {
        const err = `getTierReleations -- Error while trying to get tier relations for project ID:${tierID}, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

export const getServerReleations = async (serverDoc) => {
    try {
        const tier = await Tier.findOne({ serverIDs: { $in: serverDoc._id } });
        if (!tier) {
            throw `getServerReleations -- Server:${serverDoc._id} has not related tier`;
        }
        serverDoc._doc.tierName = tier._doc.name;
        serverDoc._doc.tierID = tier._doc._id.toString();
        const project = await Project.findOne({ tierIDs: { $in: tier._doc._id } });
        if (!project) {
            throw `getServerReleations -- Tier ${tier._doc._id.toString()} has no related Project`;
        }
        serverDoc._doc.projectName = project._doc.name;
        serverDoc._doc.projectID = project._doc._id.toString();
        const externalPromises = [
            ActionJob.find({ status: 'In Progress', serverID: serverDoc._id }).limit(1),
            StatusCheck.findOne({ serverID: serverDoc._id }).sort({ _id: -1 }).limit(1),
            AlertCollector.find({ server: serverDoc.fullHostname, state: { $nin: ['resolved'] } }).countDocuments()
        ];
        const responses = await Promise.allSettled(externalPromises);
        serverDoc._doc.jobsInProgress = responses[0]?.value?.length > 0;
        serverDoc._doc.statusCheck = {};
        serverDoc._doc.statusCheck = responses[1]?.value ? responses[1]?.value._doc : null;
        serverDoc._doc.openAlerts = responses[2]?.value ? responses[2]?.value : null;

        const promises = [];
        for (const fact in Facts) {
            const fieldToFind = Facts[fact];
            if (fieldToFind === 'hostname') {
                continue;
            }
            promises.push(extractFactsValues(serverDoc, fieldToFind));
        }
        const promisesResult = await Promise.all(promises);
        for (const promiseResult in promisesResult) {
            serverDoc._doc[promisesResult[promiseResult].field] = promisesResult[promiseResult].value;
        }
        return serverDoc;
    } catch (ex) {
        const err = `getServerReleations -- Error while trying to get server relations for server ID:${serverDoc._id}, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

export const getRelatedServersByTierID = async (tierID) => {
    try {
        const isTierFound = await Tier.findById(tierID);
        if (!isTierFound) {
            throw `getRelatedServersByTierID -- Tier:${tierID} not found`;
        }
        if (isTierFound.serverIDs.length === 0) {
            isTierFound._doc.server = [];
            return {
                tier: isTierFound._doc,
                servers: []
            };
        }
        const promises = [];
        for (const serverID of isTierFound.serverIDs) {
            promises.push(getServerDetailsByID(serverID, true));
        }
        const response = await Promise.all(promises);
        return {
            tier: isTierFound,
            servers: response
        };
    } catch (ex) {
        const err = `getRelatedServersByTierID -- Error while trying to get related servers for tierID ${tierID}, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

export const getServerDetailsByID = async (serverID, isGetFactDetails = false) => {
    try {
        const isServerFound = await Server.findById(serverID);
        if (!isServerFound) {
            throw `getServerDetailsByID -- Server:${serverID} not found`;
        }
        if (isGetFactDetails) {
            const promises = [];
            for (const fact in Facts) {
                const fieldToFind = Facts[fact];
                if (fieldToFind === 'hostname') {
                    continue;
                }
                const GenericModal = getModalByFactType(fieldToFind);
                promises.push(GenericModal.findById(isServerFound._doc[fieldToFind]));
            }
            const promisesResult = await Promise.all(promises);
            let index = 0;
            for (const fact in Facts) {
                const fieldToFind = Facts[fact];
                if (fieldToFind === 'hostname') {
                    continue;
                }
                if (promisesResult[index]) {
                    isServerFound._doc[fieldToFind] = promisesResult[index]._doc?.name;
                }
                index++;
            }
        }
        const statusCheck = await StatusCheck.findOne({ serverID: isServerFound._id }).sort({ _id: -1 }).limit(1);
        isServerFound._doc.statusCheck = {};
        isServerFound._doc.statusCheck = statusCheck ? statusCheck._doc : null;
        return isServerFound;
    } catch (ex) {
        const err = `getServerDetailsByID -- Error while trying to get server:${serverID} details, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

export const getServerParentsDetails = async (serverFullHostname) => {
    try {
        const serverObj = await Server.findOne({ fullHostname: serverFullHostname });
        if (!serverObj) {
            throw `getServerReleations -- Server:${serverFullHostname} has not related server`;
        }
        const serverID = serverObj._doc._id.toString();
        const tier = await Tier.findOne({ serverIDs: { $in: serverID } });
        if (!tier) {
            throw `getServerReleations -- Server:${serverID} has not related tier`;
        }
        const project = await Project.findOne({ tierIDs: { $in: tier._doc._id } });
        if (!project) {
            throw `getServerReleations -- Tier ${tier._doc._id.toString()} has no related Project`;
        }
        const cloudspace = await Cloudspace.findOne({ projectIDs: { $in: project._doc._id } });
        return {
            cloudspace: {
                id: cloudspace._doc._id.toString(),
                name: cloudspace._doc.name
            },
            project: {
                id: project._doc._id.toString(),
                name: project._doc.name
            },
            tier: {
                id: tier._doc._id.toString(),
                name: tier._doc.name
            }
        };
    } catch (ex) {
        const err = `getServerReleations -- Server:${serverFullHostname},Error:${ex}`;
        console.error(err);
        throw err;
    }
};

export const deleteCloudspaceRelation = async (cloudspaceID, session) => {
    try {
        const cloudspaceObject = await Cloudspace.findById(cloudspaceID);
        if (!cloudspaceObject) {
            throw `deleteCloudspaceRelation -- Failed to find Cloudspace:${cloudspaceID}`;
        }
        const projectIDsArray = cloudspaceObject._doc.projectIDs;
        for (const projectID of projectIDsArray) {
            await deleteProjectRelation(projectID, session);
        }
        const isCloudspaceDeleted = await Cloudspace.findByIdAndDelete(cloudspaceID, { session });
        if (!isCloudspaceDeleted) {
            throw `Faild to delete cloudspace:${cloudspaceID}`;
        }
        const isRoleDeleted = await Role.findOneAndDelete({ cloudspaceID: cloudspaceID }, { session });
        if (!isRoleDeleted) {
            throw `Faild to delete Role for cloudspace:${cloudspaceID}`;
        }
        const isSshKeyDeleted = await SshKey.findOneAndDelete({ cloudspaceID: cloudspaceID }, { session });
        if (!isSshKeyDeleted) {
            throw `Faild to delete sshKey for cloudspace:${cloudspaceID}`;
        }
        return;
    } catch (ex) {
        const err = `deleteCloudspaceRelation -- Error while trying to delete cloudspace:${cloudspaceID},Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const deleteProjectRelation = async (projectID, session) => {
    try {
        const projectObject = await Project.findById(projectID);
        if (!projectObject) {
            throw `deleteProjectRelation -- Failed to find Project:${projectID}`;
        }
        const tierIDsArray = projectObject._doc.tierIDs;
        for (const tierID of tierIDsArray) {
            await deleteTierRelation(tierID, projectID, session);
        }
        const isProjectDeleted = await Project.findByIdAndDelete(projectID, { session });
        if (!isProjectDeleted) {
            throw `deleteProjectRelation -- Failed to delete project:${projectID}`;
        }
        const cloudspaceUpdated = await Cloudspace.findOneAndUpdate({ projectIDs: { $in: projectID } }, { $pull: { projectIDs: projectID } }, { session });
        if (!cloudspaceUpdated) {
            throw `deleteProjectRelation -- Failed to delete project:${projectID} from cloudspace`;
        }
        const isActionJobConfigDeleted = await ActionJobConfig.deleteMany({ projectID: projectID }, { session });
        if (!isActionJobConfigDeleted) {
            throw `deleteProjectRelation -- Failed to delete project:${projectID} from action job configuration`;
        }
        return isProjectDeleted;
    } catch (ex) {
        const err = `deleteProjectRelation -- Error while trying to delete project:${projectID},Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const deleteTierRelation = async (tierID, projectID, session) => {
    try {
        const tierObject = await Tier.findById(tierID);
        if (!tierObject) {
            throw `deleteTierRelation -- Failed to find Tier:${tierID}`;
        }
        const serverIDsArray = tierObject._doc.serverIDs;
        for (const serverID of serverIDsArray) {
            await deleteServerRelation(serverID, tierID, session);
        }
        const isK8sDeleted = await K8S.deleteMany({ tierID: tierID }, { session });
        if (!isK8sDeleted.ok) {
            throw `deleteTierRelation -- Failed to delete k8s configs for Tier:${tierID}`;
        }
        await Tenant.findOneAndDelete({ tierID: tierID }, { session });
        const isTierDeleted = await Tier.findByIdAndDelete(tierID, { session });
        if (!isTierDeleted) {
            throw `deleteTierRelation -- Failed to delete Tier:${tierID}`;
        }
        console.log(`deleteTierRelation -- Trying to unrelate tier:${tierID} from his project:${projectID}`);
        const projectUpdated = await Project.findByIdAndUpdate(projectID, { $pull: { tierIDs: tierID } }, { session });
        if (!projectUpdated) {
            throw `deleteTierRelation -- Failed to unrelate tier:${tierID} from his project:${projectID}`;
        }
        console.log(`deleteTierRelation -- Succeeded to delete Tier:${tierID}`);
        return isTierDeleted;
    } catch (ex) {
        const err = `deleteTierRelation -- Error while trying to delete Tier:${tierID},Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const deleteServerRelation = async (serverID, tierID, session) => {
    try {
        const isServerDeleted = await Server.findByIdAndDelete(serverID, { session });
        if (!isServerDeleted) {
            throw `deleteServerRelation -- Failed to delete server:${serverID}`;
        }
        console.log(`deleteServerRelation -- Trying to unrelate server:${serverID} from his tier:${tierID}`);
        const tierUpdated = await Tier.findByIdAndUpdate(tierID, { $pull: { serverIDs: serverID } }, { session });
        if (!tierUpdated) {
            throw `deleteServerRelation -- Failed to unrelate server:${serverID} from his tier:${tierID}`;
        }
        console.log(`deleteServerRelation -- Succeeded to delete server:${serverID}`);
    } catch (ex) {
        const err = `deleteServerRelation -- Error while trying to delete Server:${serverID},Error:${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

const extractFactsValues = async (serverDoc, fieldToFind) => {
    try {
        const GenericModal = getModalByFactType(fieldToFind);
        const factValueIsFounded = await GenericModal.findById(serverDoc._doc[fieldToFind]);
        return {
            field: fieldToFind,
            value: factValueIsFounded?._doc?.name
        };
    } catch (ex) {
        console.error(ex);
        throw ex;
    }
};
