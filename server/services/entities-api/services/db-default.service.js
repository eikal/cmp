import {
    BtInfraNetwork,
    BtInfraCluster,
    BtTier,
    BtEnv,
    BtCustomer,
    BtLob,
    BtProduct,
    BtRole,
    FirewallGroup,
    Environment,
    Cpu,
    Memory,
    AdditionalDisk,
    Datacenter,
    Hostname,
    OsVersion,
    Hostgroup
} from '../models/facts/index.js';
import FACTS_VALUES from '../config/default-facts-values.js';
const options = { upsert: true };

export const insertDefaultDocuments = () => {
    try {
        insertBtCustomers();
        insertBtProducts();
        insertBtLob();
        insertBtTier();
        insertBtEnv();
        insertBtRole();
        insertFirewallGroup();
        insertEnvironment();
        insertBtInfraCluster();
        insertBtInfraNetwork();
        insertCpu();
        insertMemory();
        insertAdditionalDisk();
        insertDatacenter();
        insertHostname();
        insertOsVersion();
        insertHostgroup();
    } catch (ex) {
        const err = `Failed to insert default values to DB,Error:${ex}`;
        console.error(err);
        throw err;
    }
};

const insertBtCustomers = async () => {
    for (const name of FACTS_VALUES.BT_CUSTOMER_VALUES) {
        await BtCustomer.findOneAndUpdate({ name: name }, { $setOnInsert: { name: name, createdDate: new Date(), updatedDate: new Date() } }, options);
    }
};

const insertBtProducts = async () => {
    for (const name of FACTS_VALUES.BT_PRODUCT_VALUES) {
        await BtProduct.findOneAndUpdate({ name: name }, { $setOnInsert: { name: name, createdDate: new Date(), updatedDate: new Date() } }, options);
    }
};

const insertBtLob = async () => {
    for (const name of FACTS_VALUES.BT_LOB_VALUES) {
        await BtLob.findOneAndUpdate({ name: name }, { $setOnInsert: { name: name, createdDate: new Date(), updatedDate: new Date() } }, options);
    }
};

const insertBtTier = async () => {
    for (const name of FACTS_VALUES.BT_TIER_VALUES) {
        await BtTier.findOneAndUpdate({ name: name }, { $setOnInsert: { name: name, createdDate: new Date(), updatedDate: new Date() } }, options);
    }
};

const insertBtRole = async () => {
    for (const name of FACTS_VALUES.BT_ROLE_VALUES) {
        await BtRole.findOneAndUpdate({ name: name }, { $setOnInsert: { name: name, createdDate: new Date(), updatedDate: new Date() } }, options);
    }
};

const insertBtEnv = async () => {
    for (const name of FACTS_VALUES.BT_ENV_VALUES) {
        await BtEnv.findOneAndUpdate({ name: name }, { $setOnInsert: { name: name, createdDate: new Date(), updatedDate: new Date() } }, options);
    }
};

const insertFirewallGroup = async () => {
    for (const firewallObj of FACTS_VALUES.FIREWALL_GROUP_VALUES) {
        for (const tier of firewallObj.tier) {
            await FirewallGroup.findOneAndUpdate({ name: firewallObj.firewallGroup }, { $setOnInsert: { name: firewallObj.firewallGroup, createdDate: new Date(), updatedDate: new Date(), tier: tier, role: firewallObj.role, env: firewallObj.env } }, options);
        }
    }
};

const insertEnvironment = async () => {
    for (const name of FACTS_VALUES.ENVIRONMENT_VALUES) {
        await Environment.findOneAndUpdate({ name: name }, { $setOnInsert: { name: name, createdDate: new Date(), updatedDate: new Date() } }, options);
    }
};

const insertBtInfraCluster = async () => {
    for (const clusterObj of FACTS_VALUES.BT_INFRA_CLUSTER_VALUES) {
        for (const cluster of clusterObj.clusters) {
            await BtInfraCluster.findOneAndUpdate({ name: cluster }, { $setOnInsert: { name: cluster, createdDate: new Date(), updatedDate: new Date(), dataCenterName: clusterObj.dataCenterName } }, options);
        }
    }
};

const insertBtInfraNetwork = async () => {
    for (const networkObj of FACTS_VALUES.BT_INFRA_NETWORK_VALUES) {
        for (const network of networkObj.networks) {
            await BtInfraNetwork.findOneAndUpdate({ name: network }, { $setOnInsert: { name: network, createdDate: new Date(), updatedDate: new Date(), dataCenterName: networkObj.dataCenterName, tier: networkObj.tier } }, options);
        }
    }
};

const insertCpu = async () => {
    for (const name of FACTS_VALUES.CPU_VALUES) {
        await Cpu.findOneAndUpdate({ name: name }, { $setOnInsert: { name: name, createdDate: new Date(), updatedDate: new Date() } }, options);
    }
};

const insertMemory = async () => {
    for (const name of FACTS_VALUES.MEMORY_VALUES) {
        await Memory.findOneAndUpdate({ name: name }, { $setOnInsert: { name: name, createdDate: new Date(), updatedDate: new Date() } }, options);
    }
};

const insertAdditionalDisk = async () => {
    for (const name of FACTS_VALUES.ADDITIONAL_DISK_VALUES) {
        await AdditionalDisk.findOneAndUpdate({ name: name }, { $setOnInsert: { name: name, createdDate: new Date(), updatedDate: new Date() } }, options);
    }
};

const insertDatacenter = async () => {
    for (const datacenterObj of FACTS_VALUES.DATACENTER_VALUES) {
        await Datacenter.findOneAndUpdate({ name: datacenterObj.name }, { $setOnInsert: { name: datacenterObj.name, secondName: datacenterObj.secondName, createdDate: new Date(), updatedDate: new Date() } }, options);
    }
};

const insertHostname = async () => {
    for (const hostnameObj of FACTS_VALUES.HOSTNAME_VALUES) {
        await Hostname.findOneAndUpdate({ name: hostnameObj.name }, { $setOnInsert: { name: hostnameObj.name, dataCenterName: hostnameObj.dataCenterName, createdDate: new Date(), updatedDate: new Date() } }, options);
    }
};

const insertOsVersion = async () => {
    for (const name of FACTS_VALUES.OS_VERSION_VALUES) {
        await OsVersion.findOneAndUpdate({ name: name }, { $setOnInsert: { name: name, createdDate: new Date(), updatedDate: new Date() } }, options);
    }
};

const insertHostgroup = async () => {
    for (const name of FACTS_VALUES.HOSTGROUP_VALUES) {
        await Hostgroup.findOneAndUpdate({ name: name }, { $setOnInsert: { name: name, createdDate: new Date(), updatedDate: new Date() } }, options);
    }
};
