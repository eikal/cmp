import k8s from '@kubernetes/client-node';
import axios from 'axios';
import HttpCodes from '../../../shared/http-status-codes.js';

export const getK8sApiConnection = async () => {
    try {
        const kc = new k8s.KubeConfig();
        kc.loadFromFile(process.env.KUBECONFIG);
        const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
        return k8sApi;
    } catch (ex) {
        const err = `getK8sConnection -- Error while trying to get k8s connection, Error: ${ex}`;
        console.error(err);
        throw err;
    }
};

export const getAllNamespacesAPI = async () => {
    try {
        const res = await axios.get(`${process.env.KUBE_DASHBOARD}/api/v1/namespace`);
        if (res?.status === HttpCodes.OK && res?.data?.namespaces) {
            return res.data.namespaces.map((namespace) => namespace.objectMeta.name);
        }
        throw 'Failed to get namespaces';
    } catch (ex) {
        const err = `getAllNamespacesAPI -- Error while trying to all namespaces, Error: ${ex}`;
        console.error(err);
        throw err;
    }
};

export const getDashboardStatsGenericByNamespace = async (namespace, statsType) => {
    try {
        console.log(`getDashboardStatsGenericByNamespace -- Trying to get stats:${statsType} for namespace:${namespace}`);
        const LabelName = parseLabelName(statsType);
        const res = await axios.get(`${process.env.KUBE_DASHBOARD}/api/v1/${statsType}/${namespace}`);
        if (res?.status === HttpCodes.OK) {
            if (statsType === 'namespace') {
                const status = { active: 0, inactive: 0 };
                if (res.data.phase === 'Active') status.active = 1;
                if (res.data.phase === 'Inactive') status.inactive = 1;
                return {
                    status: status,
                    total: 1,
                    statsType: LabelName
                };
            }
            if (statsType === 'pod' || statsType === 'job' || statsType === 'replicaset' || statsType === 'statefulset' || statsType === 'deployment') {
                console.log(`getDashboardStatsGenericByNamespace -- found :${res.data.listMeta.totalItems} items for ${statsType} in ${namespace}`);
                return {
                    status: res.data.status,
                    total: res.data.listMeta.totalItems,
                    statsType: LabelName
                };
            }
            if (statsType === 'service' || statsType === 'configmap') {
                console.log(`getDashboardStatsGenericByNamespace -- found :${res.data.listMeta.totalItems} items for ${statsType} in ${namespace}`);
                return {
                    status: null,
                    total: res.data.listMeta.totalItems,
                    statsType: LabelName
                };
            }
            return res.data.namespaces.map((namespace) => namespace.objectMeta.name);
        }
        throw 'Failed to get stats';
    } catch (ex) {
        const err = `getDashboardStatsGenericByNamespace -- Error while trying to get stats:${statsType} for namespace:${namespace}, Error: ${ex}`;
        console.error(err);
        throw err;
    }
};

export const getPodsNamespace = async (namespace) => {
    try {
        const res = await axios.get(`${process.env.KUBE_DASHBOARD}/api/v1/pod/${namespace}`);
        if (res?.status === HttpCodes.OK && res?.data?.pods) {
            return res.data.pods.map((pod) => {
                return {
                    name: pod.objectMeta.name,
                    namespace: pod.objectMeta.namespace,
                    status: pod.podStatus.status,
                    restarts: pod.restartCount,
                    created: pod.objectMeta.creationTimestamp,
                    node: pod.nodeName,
                    containerStatus: pod.podStatus?.containerStates ? pod.podStatus?.containerStates[0] : pod.podStatus.status
                };
            });
        }
        throw 'Failed to get pods';
    } catch (ex) {
        const err = `getPodsNamespace -- Error while trying to get pods by namespace:${namespace}, Error: ${ex}`;
        console.error(err);
        throw err;
    }
};

export const getPodsMetadataByNamespace = async (namespace, pod) => {
    try {
        const res = await axios.get(`${process.env.KUBE_DASHBOARD}/api/v1/pod/${namespace}/${pod}`);
        if (res?.status === HttpCodes.OK) {
            return res.data;
        }
        throw `Failed to get pods metadate:${pod} on namespace:${namespace}`;
    } catch (ex) {
        const err = `getPodsMetadataByNamespace -- Error while trying to gets pod: ${pod} metadata by namespace:${namespace}, Error: ${ex}`;
        console.error(err);
        throw err;
    }
};

export const getDeploymentsNamespace = async (namespace) => {
    try {
        const res = await axios.get(`${process.env.KUBE_DASHBOARD}/api/v1/deployment/${namespace}`);
        if (res?.status === HttpCodes.OK && res?.data?.deployments) {
            return res.data.deployments.map((deployment) => {
                return {
                    name: deployment?.objectMeta.name,
                    namespace: deployment?.objectMeta?.namespace,
                    pods: deployment?.pods,
                    created: deployment?.objectMeta?.creationTimestamp
                };
            });
        }
        throw 'Failed to get deployments';
    } catch (ex) {
        const err = `getDeploymentsNamespace -- Error while trying to get deployments by namespace:${namespace}, Error: ${ex}`;
        console.error(err);
        throw err;
    }
};

export const getDeploymentsMetadataByNamespace = async (namespace, deployment) => {
    try {
        const promises = [
            axios.get(`${process.env.KUBE_DASHBOARD}/api/v1/deployment/${namespace}/${deployment}`),
            axios.get(`${process.env.KUBE_DASHBOARD}/api/v1/deployment/${namespace}/${deployment}/newreplicaset`),
            axios.get(`${process.env.KUBE_DASHBOARD}/api/v1/deployment/${namespace}/${deployment}/event`)
        ];
        let data = {};
        const responses = await Promise.all(promises);
        if (responses[0].status === HttpCodes.OK) {
            data = responses[0].data;
        }
        if (responses[1].status === HttpCodes.OK) {
            data.replicaset = responses[1].data;
        }
        if (responses[2].status === HttpCodes.OK) {
            data.eventList = responses[2].data;
        }
        return data;
    } catch (ex) {
        const err = `getDeploymentsMetadataByNamespace -- Error while trying to gets deployment: ${deployment} metadata by namespace:${namespace}, Error: ${ex}`;
        console.error(err);
        throw err;
    }
};

const parseLabelName = (statType) => {
    if (statType === 'job') return 'Jobs';
    if (statType === 'pod') return 'Pods';
    if (statType === 'replicaset') return 'Rreplica sets';
    if (statType === 'statefulset') return 'Stateful sets';
    if (statType === 'deployment') return 'Deployments';
    if (statType === 'configmap') return 'Config maps';
    if (statType === 'namespace') return 'Namespace';
    return 'Services';
};
