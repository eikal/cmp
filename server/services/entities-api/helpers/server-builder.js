import { BtInfraNetwork, BtInfraCluster, AdditionalDisk, Hostname } from '../models/facts/index.js';
import { getModalByFactType } from './validations.js';
import Facts from '../config/facts.js';
import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

const options = { upsert: true, new: true, setDefaultsOnInsert: true };

export const generateServerObject = async (params) => {
    try {
        const serverObject = { ...params };
        serverObject[Facts.HOSTNAME] = await buildHostname(params.hostname);
        serverObject[Facts.BT_LOB] = await buildGenericType(Facts.BT_LOB, params.bt_lob);
        serverObject[Facts.ENVIRONMENT] = await buildGenericType(Facts.ENVIRONMENT, params.environment);
        serverObject[Facts.BT_ROLE] = await buildGenericType(Facts.BT_ROLE, params.bt_role);
        serverObject[Facts.BT_CUSTOMER] = await buildGenericType(Facts.BT_CUSTOMER, params.bt_customer);
        serverObject[Facts.BT_TIER] = await buildGenericType(Facts.BT_TIER, params.bt_tier);
        serverObject[Facts.BT_ENV] = await buildGenericType(Facts.BT_ENV, params.bt_env);
        serverObject[Facts.HOSTGROUP] = await buildGenericType(Facts.HOSTGROUP, params.hostgroup);
        serverObject[Facts.CPU] = await buildGenericType(Facts.CPU, params.cpu);
        serverObject[Facts.MEMORY] = await buildGenericType(Facts.MEMORY, params.memory);
        serverObject[Facts.OS_VERSION] = await buildGenericType(Facts.OS_VERSION, params.os_version);
        serverObject[Facts.BT_PRODUCT] = await buildGenericType(Facts.BT_PRODUCT, params.bt_product);
        serverObject[Facts.FIREWALL_GROUP] = await buildGenericType(Facts.FIREWALL_GROUP, params.firewall_group); // todo - check how to handle dependcies
        serverObject[Facts.BT_INFRA_NETWORK] = await buildBtInfraNetwork(params.bt_infra_network, params.dataCenter);
        serverObject[Facts.BT_INFRA_CLUSTER] = await buildInfraCluster(params.bt_infra_cluster, params.dataCenter);
        serverObject[Facts.ADDITIONAL_DISK] = await buildAdditionalDisks(params.additional_disk);

        return serverObject;
    } catch (ex) {
        const err = `generateServerObject -- Error while trying to generate server object :${params.name}, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

const buildGenericType = async (type, value) => {
    try {
        const GenericModal = getModalByFactType(type);
        if (isValidObjectId(value)) {
            const isGenericFound = await GenericModal.findById(value);
            if (!isGenericFound || !isGenericFound._doc) {
                throw `Failed to found ${type}:${value}`;
            }
            return value;
        }
        const newGenericObj = await GenericModal.findOneAndUpdate({ name: value }, { $setOnInsert: { name: value, createdDate: new Date(), updatedDate: new Date() } }, options);
        if (!newGenericObj || !newGenericObj._doc) {
            throw `Failed to create new cpu:${value}`;
        }
        return { id: newGenericObj._doc._id.toString(), name: newGenericObj.name };
    } catch (ex) {
        const err = `buildGenericType -- Error while trying to build ${type}:${value}, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

const buildHostname = async (hostname) => {
    try {
        const hostnamesPrefix = await Hostname.find({});
        for (const hostnamePrefix of hostnamesPrefix) {
            if (hostname.includes(hostnamePrefix._doc.name)) {
                return hostname;
            }
        }
        throw 'Hostname is not valid according to Hostname rules';
    } catch (ex) {
        const err = `buildHostname -- Error while trying to build hostname:${hostname}, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

const buildInfraCluster = async (infraCluster, dataCenter) => {
    try {
        if (isValidObjectId(infraCluster)) {
            const isInfraClusterFound = await BtInfraCluster.findById(infraCluster);
            if (!isInfraClusterFound || !isInfraClusterFound._doc) {
                throw `Failed to found infra_cluster:${infraCluster}`;
            }
            return infraCluster;
        }
        const newInfraCluster = await BtInfraCluster.findOneAndUpdate({ name: infraCluster }, {
            $setOnInsert:
            {
                name: infraCluster,
                createdDate: new Date(),
                updatedDate: new Date(),
                dataCenterName: dataCenter
            }
        }, options);
        if (!newInfraCluster || !newInfraCluster._doc) {
            throw `Failed to create new infra_cluster:${newInfraCluster}`;
        }
        return { id: newInfraCluster._doc._id.toString(), name: newInfraCluster.name };
    } catch (ex) {
        const err = `buildInfraCluster -- Error while trying to build infra_cluster:${infraCluster}, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

const buildBtInfraNetwork = async (infraNetwork, dataCenter) => {
    try {
        if (isValidObjectId(infraNetwork)) {
            const isInfraNetworkFound = await BtInfraNetwork.findById(infraNetwork);
            if (!isInfraNetworkFound || !isInfraNetworkFound._doc) {
                throw `Failed to found infra_network:${infraNetwork}`;
            }
            return infraNetwork;
        }
        const newInfraNetwork = await BtInfraNetwork.findOneAndUpdate({ name: infraNetwork }, {
            $setOnInsert:
            {
                name: infraNetwork,
                createdDate: new Date(),
                updatedDate: new Date(),
                dataCenterName: dataCenter
            }
        }, options);
        if (!newInfraNetwork || !newInfraNetwork._doc) {
            throw `Failed to create new infra_network:${infraNetwork}`;
        }
        return { id: newInfraNetwork._doc._id.toString(), name: newInfraNetwork.name };
    } catch (ex) {
        const err = `buildBtInfraNetwork -- Error while trying to build infra_network:${infraNetwork}, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

const buildAdditionalDisks = async (additionalDisksArray) => {
    try {
        const arrayToReturn = [];
        for (const additionalDisk of additionalDisksArray) {
            if (isValidObjectId(additionalDisk)) {
                const isCpuFound = await AdditionalDisk.findById(additionalDisk);
                if (!isCpuFound || !isCpuFound._doc) {
                    throw `Failed to found additional_disk:${additionalDisk}`;
                }
                arrayToReturn.push(additionalDisk);
            }
            const newGenericObj = await AdditionalDisk.findOneAndUpdate({ name: additionalDisk }, { $setOnInsert: { name: additionalDisk, createdDate: new Date(), updatedDate: new Date() } }, options);
            if (!newGenericObj || !newGenericObj._doc) {
                throw `Failed to create newadditional_disks:${additionalDisk}`;
            }
            arrayToReturn.push({ id: newGenericObj._doc._id.toString(), name: newGenericObj.name });
        }
        return arrayToReturn;
    } catch (ex) {
        const err = `buildAdditionalDisks -- Error while trying to build additional_disk:${additionalDisksArray}, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

export const createFullHostname = (hostname) => {
    try {
        if (process.env.LDAP_DOMAIN === 'auto') {
            return `${hostname}.${process.env.LDAP_DOMAIN}.saas-n.com`;
        }
        if (process.env.LDAP_DOMAIN === 'saas-n') {
            return `${hostname}.${process.env.LDAP_DOMAIN}.com`;
        }
        if (process.env.LDAP_DOMAIN === 'saas-p') {
            return `${hostname}.${process.env.LDAP_DOMAIN}.com`;
        }
        return hostname;
    } catch (ex) {
        const err = `createFullHostname -- Error while trying to create full hostname ${hostname}, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

export const createInvestigationURL = (fullHostname) => {
    return `https://${fullHostname}:7780/InvestigationCenter`;
};

const isValidObjectId = (id) => {
    if (ObjectId.isValid(id)) {
        if ((String)(new ObjectId(id)) === id) {
            return true;
        }
        return false;
    }
    return false;
};
