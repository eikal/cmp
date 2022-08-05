import joi from 'joi';
import HttpCodes from '../../../shared/http-status-codes.js';
import { getAllNamespacesAPI, getPodsMetadataByNamespace, getDeploymentsMetadataByNamespace } from '../helpers/k8s-client.js';
import {
    createOnboardConfig,
    getAllConfigOnboardNamespace,
    getAllNamespacesByTierID,
    removeNamespaceFromTierConfig,
    getDashboardSatsForNamespace,
    calculateAllNamespacesStats,
    getPodsForNamespace,
    getDeploymentsForNamespace
} from '../helpers/helpers.js';

const getAllNamespaces = async (req, res, next) => {
    try {
        console.log(`getAllNamespaces -- User:${req.user} Trying to get all namespaces for cloudspace:${req.query.cloudspace}`);
        const schema = joi.object().keys({
            cloudspace: joi.string().required()
        });
        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`getAllNamespaces -- User:${req.user} Failed to get all  namespaces for cloudspace:${req.query.cloudspace} ,Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const namespacesApi = await getAllNamespacesAPI();
        const namesapcesInDB = await getAllConfigOnboardNamespace(req.query.cloudspace);
        const differenceNamespaces = namespacesApi.filter(x => !namesapcesInDB.includes(x));
        console.log(`getAllNamespaces -- User:${req.user} Succeeded to get all namespaces:${differenceNamespaces.length}`);
        return res.status(HttpCodes.OK).send({ data: differenceNamespaces, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getAllNamespaces -- User:${req.user} Error while Trying to get all namespaces,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

const getOnboardNamespaces = async (req, res, next) => {
    try {
        console.log(`getOnboardNamespaces -- User:${req.user} Trying to get all onboard namespaces for cloudspace:${req.query.cloudspace}`);
        const schema = joi.object().keys({
            cloudspace: joi.string().required()
        });
        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`getOnboardNamespaces -- User:${req.user} Failed to get namespaces for cloudspace:${req.query.cloudspace} ,Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const namesapcesInDB = await getAllConfigOnboardNamespace(req.query.cloudspace);
        namesapcesInDB.unshift('All Namespaces');
        console.log(`getOnboardNamespaces -- User:${req.user} Succeeded to get all onboard namespaces:${namesapcesInDB.length}`);
        return res.status(HttpCodes.OK).send({ data: namesapcesInDB, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getOnboardNamespaces -- User:${req.user} Error while Trying to get all onboard namespaces,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

const getOnboardNamespacesByTier = async (req, res, next) => {
    try {
        console.log(`getOnboardNamespacesByTier -- User:${req.user} Trying to get all onboard namespaces by tier:${req.query.tierID}`);
        const schema = joi.object().keys({
            tierID: joi.string().required()
        });
        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`getOnboardNamespacesByTier -- User:${req.user} Error while trying to get on onboard namespaces by tier:${req.query.tierID},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const namesapcesInDB = await getAllNamespacesByTierID(req.query.tierID);
        console.log(`getOnboardNamespacesByTier -- User:${req.user} Succeeded to get all onboard namespaces by tier:${req.query.tierID}`);
        return res.status(HttpCodes.OK).send({ data: namesapcesInDB, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getOnboardNamespacesByTier -- User:${req.user} Error while Trying to get allonboard namespaces by tier:${req.query.tierID},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

const onboardNamespace = async (req, res, next) => {
    try {
        const schema = joi.object().keys({
            projectID: joi.string().required(),
            tierID: joi.string().required(),
            namespaces: joi.array().required().min(1)
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`onboardNamespace -- User:${req.user} Error while trying to get on board namespaces:${req.body.namespaces},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        req.body.createdDate = new Date();
        req.body.createdBy = req.user;
        console.log(`onboardNamespace -- User:${req.user} Trying to get on board namespaces:${req.body.namespaces}`);
        const namespaceConfig = await createOnboardConfig(req.body.tierID, req.body.createdBy, req.body.createdDate, req.body.namespaces);
        console.log(`onboardNamespace -- User:${req.user} Succeeded to get on board namespaces:${req.body.namespaces}`);
        return res.status(HttpCodes.OK).send({ data: namespaceConfig, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`onboardNamespace -- User:${req.user} Error while Trying on board namespace,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

const removeNamespaceFromTier = async (req, res, next) => {
    try {
        const schema = joi.object().keys({
            tierID: joi.string().required(),
            namespace: joi.string().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`removeNamespaceFromTier -- User:${req.user} Error while trying to remove namespace :${req.body.namespace} fron tier:${req.body.tier},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        console.log(`removeNamespaceFromTier -- User:${req.user} Trying  to remove namespace :${req.body.namespace} fron tier:${req.body.tier}`);
        await removeNamespaceFromTierConfig(req.body.tierID, req.body.namespace);
        console.log(`removeNamespaceFromTier -- User:${req.user} Succeeded  to remove namespace :${req.body.namespace} fron tier:${req.body.tier}`);
        return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`removeNamespaceFromTier -- User:${req.user} Error while Trying  to remove namespace :${req.body.namespace} fron tier:${req.body.tier},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

const getDashboardStats = async (req, res, next) => {
    try {
        const schema = joi.object().keys({
            namespace: joi.string().required(),
            cloudspace: joi.string().required()
        });
        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`getDashboardStats -- User:${req.user} Error while trying to get dashboard stats for namespace :${req.query.namespace},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        console.log(`getDashboardStats -- User:${req.user} Trying to get dashboard stats for namespace :${req.query.namespace}`);
        if (req.query.namespace === 'All Namespaces') {
            const namesapcesInDB = await getAllConfigOnboardNamespace(req.query.cloudspace);
            const promises = [];
            for (const namespaceElm of namesapcesInDB) {
                promises.push(getDashboardSatsForNamespace(namespaceElm));
            }
            const responses = await Promise.all(promises);
            const stats = await calculateAllNamespacesStats(responses);
            return res.status(HttpCodes.OK).send({ data: stats, statusCode: HttpCodes.OK, message: null });
        } else {
            const stats = await getDashboardSatsForNamespace(req.query.namespace);
            console.log(`getDashboardStats -- User:${req.user} Succeeded to get dashboard stats for namespace :${req.query.namespace}`);
            return res.status(HttpCodes.OK).send({ data: stats, statusCode: HttpCodes.OK, message: null });
        }
    } catch (ex) {
        console.error(`getDashboardStats -- User:${req.user} Error while Trying to get dashboard stats for namespace :${req.query.namespace},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

const getPodsByNamespace = async (req, res, next) => {
    try {
        const schema = joi.object().keys({
            namespace: joi.string().required(),
            cloudspace: joi.string().required()
        });
        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`getPodsByNamespace -- User:${req.user} Error while trying to get pods for namespace :${req.query.namespace},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        console.log(`getPodsByNamespace -- User:${req.user} Trying to get pods for namespace :${req.query.namespace}`);
        const pods = await getPodsForNamespace(req.query.cloudspace, req.query.namespace);
        return res.status(HttpCodes.OK).send({ data: pods, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getPodsByNamespace -- User:${req.user} Error while Trying to get pods for namespace :${req.query.namespace},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

const getPodMetadata = async (req, res, next) => {
    try {
        const schema = joi.object().keys({
            pod: joi.string().required(),
            namespace: joi.string().required()
        });
        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`getPodMetadata -- User:${req.user} Error while trying to get pod:${req.query.pod} metadata for namespace :${req.query.namespace},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        console.log(`getPodMetadata -- User:${req.user} Trying to get pod:${req.query.pod} metadata for namespace :${req.query.namespace} ${new Date()}`);
        const podData = await getPodsMetadataByNamespace(req.query.namespace, req.query.pod);
        console.log(`getPodMetadata -- User:${req.user} Found:${req.query.pod} metadata for namespace :${req.query.namespace}`);
        return res.status(HttpCodes.OK).send({ data: podData, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getPodMetadata -- User:${req.user} Error while Trying to get pod:${req.query.pod} metadata for namespace :${req.query.namespace},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

const getDeploymentsByNamespace = async (req, res, next) => {
    try {
        const schema = joi.object().keys({
            namespace: joi.string().required(),
            cloudspace: joi.string().required()
        });
        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`getDeploymentsByNamespace -- User:${req.user} Error while trying to get deployments for namespace :${req.query.namespace},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        console.log(`getDeploymentsByNamespace -- User:${req.user} Trying to get deployments for namespace :${req.query.namespace}`);
        const pods = await getDeploymentsForNamespace(req.query.cloudspace, req.query.namespace);
        return res.status(HttpCodes.OK).send({ data: pods, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getDeploymentsByNamespace -- User:${req.user} Error while Trying to get deployments for namespace :${req.query.namespace},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

const getDeploymentMetadata = async (req, res, next) => {
    try {
        const schema = joi.object().keys({
            deployment: joi.string().required(),
            namespace: joi.string().required()
        });
        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`getDeploymentMetadata -- User:${req.user} Error while trying to get deployment:${req.query.deployment} metadata for namespace :${req.query.namespace},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        console.log(`getDeploymentMetadata -- User:${req.user} Trying to get deployment:${req.query.deployment} metadata for namespace :${req.query.namespace} ${new Date()}`);
        const deploymentData = await getDeploymentsMetadataByNamespace(req.query.namespace, req.query.deployment);
        console.log(`getDeploymentMetadata -- User:${req.user} Found:${req.query.deployment} metadata for namespace :${req.query.namespace}`);
        return res.status(HttpCodes.OK).send({ data: deploymentData, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getDeploymentMetadata -- User:${req.user} Error while Trying to get deployment:${req.query.deployment} metadata for namespace :${req.query.namespace},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
    }
};

export default {
    getAllNamespaces,
    onboardNamespace,
    getOnboardNamespaces,
    getOnboardNamespacesByTier,
    removeNamespaceFromTier,
    getDashboardStats,
    getPodsByNamespace,
    getPodMetadata,
    getDeploymentsByNamespace,
    getDeploymentMetadata
};
