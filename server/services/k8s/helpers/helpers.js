import K8S from '../models/k8s.model.js';
import Cloudspace from '../../entities-api/models/cloudspace/cloudspace.model.js';
import Project from '../../entities-api/models/project/project.model.js';
import { getDashboardStatsGenericByNamespace, getPodsNamespace, getDeploymentsNamespace } from './k8s-client.js';

export const createOnboardConfig = async (tierID, createdBy, createdDate, namespacesaArray) => {
    try {
        const isNameSpaceExist = await K8S.find({ tierID: tierID });
        if (isNameSpaceExist && isNameSpaceExist.length > 0) {
            for (const elm of namespacesaArray) {
                await K8S.findOneAndUpdate({ tierID: tierID }, { $addToSet: { namespaces: elm } });
            }
            const newArray = [...isNameSpaceExist[0]._doc.namespaces, ...namespacesaArray];
            isNameSpaceExist[0]._doc.namespaces = newArray;
            return isNameSpaceExist[0]._doc;
        }
        const namespaceConfig = {
            tierID: tierID,
            createdBy: createdBy,
            createdDate: createdDate,
            namespaces: namespacesaArray
        };
        const namespaceConfigOjb = new K8S(namespaceConfig);
        const isNamespaceCreated = await namespaceConfigOjb.save(namespaceConfigOjb);
        if (isNamespaceCreated?._doc) {
            console.log(`createOnboardConfig -- Succeeded to create new namespace:${namespacesaArray}`);
            return isNamespaceCreated._doc;
        }
        throw `Failed to create namespace:${namespacesaArray} for tierID:${tierID}`;
    } catch (ex) {
        const err = `createOnboardConfig -- Error while trying to create namespace:${namespacesaArray}, Error: ${ex}`;
        console.error(err);
        throw err;
    }
};

export const getAllConfigOnboardNamespace = async (cloudspace) => {
    try {
        const isCloudspaceIsFound = await Cloudspace.findById(cloudspace);
        if (!isCloudspaceIsFound) {
            throw `getAllConfigOnboardNamespace -- Faild to find cloudspace:${cloudspace}`;
        }
        const isProjectsFound = await Project.find({ _id: { $in: isCloudspaceIsFound._doc.projectIDs } });
        if (!isProjectsFound) {
            throw `getAllConfigOnboardNamespace -- Faild to find projects in cloudspace:${cloudspace}`;
        }
        const tierIDs = [];
        for (const project of isProjectsFound) {
            for (const tierID of project._doc.tierIDs) {
                tierIDs.push(tierID);
            }
        }
        const namespaces = await K8S.find({ tierID: { $in: tierIDs } });
        const namespacesArray = [];
        for (const namespace of namespaces) {
            for (const elm of namespace.namespaces) {
                namespacesArray.push(elm);
            }
        }
        return namespacesArray;
    } catch (ex) {
        const err = `getAllConfigOnboardNamespace -- Error while trying to get all namespaces, Error: ${ex}`;
        console.error(err);
        throw err;
    }
};

export const getAllNamespacesByTierID = async (tierID) => {
    try {
        const namespaces = await K8S.find({ tierID: tierID });
        if (namespaces && namespaces.length > 0) {
            return namespaces[0];
        }
        return null;
    } catch (ex) {
        const err = `getAllNamespacesByTierID -- Error while trying to get all namespaces by tierID:${tierID}, Error: ${ex}`;
        console.error(err);
        throw err;
    }
};

export const removeNamespaceFromTierConfig = async (tierID, namespace) => {
    try {
        const isNamespaceRemoved = await K8S.findOneAndUpdate({ tierID: tierID }, { $pull: { namespaces: namespace } });
        if (!isNamespaceRemoved) {
            throw 'Failed remove namespace';
        }
        return;
    } catch (ex) {
        const err = `removeNamespaceFromTierConfig -- Error while trying to remove namespace:${namespace} from tierID:${tierID}, Error: ${ex}`;
        console.error(err);
        throw err;
    }
};

export const getDashboardSatsForNamespace = async (namespace) => {
    try {
        const promises = [
            getDashboardStatsGenericByNamespace(namespace, 'namespace'),
            getDashboardStatsGenericByNamespace(namespace, 'pod'),
            getDashboardStatsGenericByNamespace(namespace, 'job'),
            getDashboardStatsGenericByNamespace(namespace, 'replicaset'),
            getDashboardStatsGenericByNamespace(namespace, 'statefulset'),
            getDashboardStatsGenericByNamespace(namespace, 'deployment'),
            getDashboardStatsGenericByNamespace(namespace, 'service'),
            getDashboardStatsGenericByNamespace(namespace, 'configmap')
        ];
        const responses = await Promise.all(promises);
        return responses;
    } catch (ex) {
        const err = `getDashboardSatsForNamespace -- Error while trying to get dashboard stats for namespace:${namespace}, Error: ${ex}`;
        console.error(err);
        throw err;
    }
};

export const calculateAllNamespacesStats = (stats) => {
    try {
        const totalStats = [
            { statsType: 'Namespace', status: { active: 0, inactive: 0 }, total: 0 },
            { statsType: 'Pods', status: { running: 0, failed: 0, pending: 0, succeeded: 0 }, total: 0 },
            { statsType: 'Jobs', status: { running: 0, failed: 0, pending: 0, succeeded: 0 }, total: 0 },
            { statsType: 'Replica sets', status: { running: 0, failed: 0, pending: 0, succeeded: 0 }, total: 0 },
            { statsType: 'Stateful sets', status: { running: 0, failed: 0, pending: 0, succeeded: 0 }, total: 0 },
            { statsType: 'Deployments', status: { running: 0, failed: 0, pending: 0, succeeded: 0 }, total: 0 },
            { statsType: 'Services', total: 0 },
            { statsType: 'Config maps', total: 0 }
        ];
        for (const stat of stats) {
            totalStats[0].status.active += stat[0].status.active;
            totalStats[0].status.inactive += stat[0].status.inactive;
            totalStats[0].total = totalStats[0].status.active + totalStats[0].status.inactive;
            for (let i = 1; i <= 5; i++) {
                totalStats[i].status.running += stat[i].status.running;
                totalStats[i].status.failed += stat[i].status.failed;
                totalStats[i].status.pending += stat[i].status.pending;
                totalStats[i].status.succeeded += stat[i].status.succeeded;
                totalStats[i].total = totalStats[i].status.running + totalStats[i].status.failed + totalStats[i].status.pending + totalStats[i].status.succeeded;
            }
            totalStats[6].total = totalStats[6].total + stat[6].total;
            totalStats[7].total = totalStats[7].total + stat[7].total;
        }
        return totalStats;
    } catch (ex) {
        const err = `calculateAllNamespacesStats -- Error while trying to calculate all namespaces, Error: ${ex}`;
        console.error(err);
        throw err;
    }
};

export const getPodsForNamespace = async (cloudspace, namespace) => {
    try {
        if (namespace === 'All Namespaces') {
            const namesapcesInDB = await getAllConfigOnboardNamespace(cloudspace);
            const promises = [];
            for (const namespaceElm of namesapcesInDB) {
                promises.push(getPodsNamespace(namespaceElm));
            }
            const allPods = await Promise.all(promises);
            console.log('getPodsByNamespace -- Succeeded to get pods for all namespaces pods');
            const pods = [].concat.apply([], allPods);
            return pods;
        } else {
            const pods = await getPodsNamespace(namespace);
            console.log(`getPodsByNamespace -- Succeeded to get pods :${pods.length} for namespace :${namespace}`);
            return pods;
        }
    } catch (ex) {
        const err = `getPodsByNamespace -- Error while trying to get Pods for namespace:${namespace}, Error: ${ex}`;
        console.error(err);
        throw err;
    }
};

export const getDeploymentsForNamespace = async (cloudspace, namespace) => {
    try {
        if (namespace === 'All Namespaces') {
            const namesapcesInDB = await getAllConfigOnboardNamespace(cloudspace);
            const promises = [];
            for (const namespaceElm of namesapcesInDB) {
                promises.push(getDeploymentsNamespace(namespaceElm));
            }
            const allDeployments = await Promise.all(promises);
            console.log('getDeploymentsForNamespace -- Succeeded to get deployments for all namespaces');
            const deployments = [].concat.apply([], allDeployments);
            return deployments;
        } else {
            const deployments = await getDeploymentsNamespace(namespace);
            console.log(`getDeploymentsForNamespace -- Succeeded to get deployments :${deployments.length} for namespace :${namespace}`);
            return deployments;
        }
    } catch (ex) {
        const err = `getDeploymentsForNamespace -- Error while trying to get deployments for namespace:${namespace}, Error: ${ex}`;
        console.error(err);
        throw err;
    }
};
