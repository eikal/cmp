import joi from 'joi';
import {
    BtProduct,
    BtCustomer,
    BtLob,
    BtTier,
    BtEnv,
    BtRole,
    BtInfraNetwork,
    BtInfraCluster,
    BtArtemisVersion,
    Environment,
    FirewallGroup,
    Cpu,
    Memory,
    AdditionalDisk,
    Datacenter,
    Hostname,
    OsVersion,
    Hostgroup
} from '../models/facts/index.js';
import FACTS from '../config/facts.js';

export const validateFactType = (factType) => {
    try {
        if (Object.values(FACTS).indexOf(factType) > -1) {
            return true;
        }
        return false;
    } catch (ex) {
        const err = `validateFactType -- Error while trying to validate fact :${factType}, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

export const validateJoiSchema = (params) => {
    try {
        if (params.factType === FACTS.BT_INFRA_CLUSTER) {
            return joi.object().keys({
                factType: joi.string().required(),
                name: joi.string().required(),
                dataCenterName: joi.string().required()
            });
        }
        if (params.factType === FACTS.BT_INFRA_NETWORK) {
            return joi.object().keys({
                factType: joi.string().required(),
                name: joi.string().required(),
                dataCenterName: joi.string().required(),
                btTierName: joi.string().required()
            });
        }
        if (params.factType === FACTS.FIREWALL_GROUP) {
            return joi.object().keys({
                factType: joi.string().required(),
                name: joi.string().required(),
                btTierName: joi.string().required(),
                role: joi.string().required(),
                env: joi.string().required()

            });
        }
        return joi.object().keys({
            factType: joi.string().required(),
            name: joi.string().required()
        });
    } catch (ex) {
        const err = `validateJoiSchema -- Error while trying to validate joi schema, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

export const getModalByFactType = (factType) => {
    try {
        if (FACTS.BT_CUSTOMER === factType) {
            return BtCustomer;
        }
        if (FACTS.BT_PRODUCT === factType) {
            return BtProduct;
        }
        if (FACTS.BT_LOB === factType) {
            return BtLob;
        }
        if (FACTS.BT_TIER === factType) {
            return BtTier;
        }
        if (FACTS.BT_ENV === factType) {
            return BtEnv;
        }
        if (FACTS.BT_ROLE === factType) {
            return BtRole;
        }
        if (FACTS.BT_INFRA_NETWORK === factType) {
            return BtInfraNetwork;
        }
        if (FACTS.BT_INFRA_CLUSTER === factType) {
            return BtInfraCluster;
        }
        if (FACTS.BT_ARTEMIS_VERSION === factType) {
            return BtArtemisVersion;
        }
        if (FACTS.FIREWALL_GROUP === factType) {
            return FirewallGroup;
        }
        if (FACTS.ENVIRONMENT === factType) {
            return Environment;
        }
        if (FACTS.CPU === factType) {
            return Cpu;
        }
        if (FACTS.MEMORY === factType) {
            return Memory;
        }
        if (FACTS.ADDITIONAL_DISK === factType) {
            return AdditionalDisk;
        }
        if (FACTS.DATACENTER === factType) {
            return Datacenter;
        }
        if (FACTS.HOSTNAME === factType) {
            return Hostname;
        }
        if (FACTS.OS_VERSION === factType) {
            return OsVersion;
        }
        if (FACTS.HOSTGROUP === factType) {
            return Hostgroup;
        }
        throw `Fact type:${factType} has no schema in DB`;
    } catch (ex) {
        const err = `validateJoiSchema -- Error while trying to validate joi schema, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};
