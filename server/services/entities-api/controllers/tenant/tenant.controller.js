import joi from 'joi';
import {
    getCfrmToken,
    getKeycloakToken,
    apacheDsConnection,
    getWlsTenants,
    getLegacyTenants,
    getTenantWlsUsers,
    getTenanLegacyUsers,
    updateUserDetailsWlsInTenant,
    updateUserPasswordWlsInTenant,
    updateUserPasswordLegacyInTenant,
    updateUserDetailsLegacyInTenant,
    deleteWlsUserInTenant,
    deleteLegacyUserInTenant,
    deleteLegacyTenant,
    createUserInTenant,
    getTenantGroupsOfUser,
    getTenantGroups,
    manageUserWithGroup,
    createTenantOnKeycloak,
    createTenantOnInvestigationCenter,
    createTenantOnWls,
    patchTenantOnWls,
    updateTenantPropertiesOnInvestigationCenter,
    parseTenantsParams,
    validateSchemaTenantConfiguration
} from '../../helpers/tenant.js';
import HttpCodes from '../../../../shared/http-status-codes.js';
import Tenant from '../../models/tenant/tenant.model.js';
import { testConnection } from '../../../../shared/oracledb.js';

const getAllTenants = async (req, res, next) => {
    try {
        console.log(`getAllTenants -- User:${req.user} Trying to get all tenant`);
        const schema = joi.object().keys({
            id: joi.string().required()
        });
        const result = schema.validate(req.params);
        if (result.error) {
            console.error(`getUsersByTenantID -- User:${req.user} Error while Trying to get users for tenantID:${req.params.id}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const tenantConfig = await Tenant.find({ tierID: req.params.id });
        if (!tenantConfig || !Array.isArray(tenantConfig) || tenantConfig.length === 0) {
            console.log(`getTenantConfigurationByID -- User:${req.user} not found tenant configuration for tierID:${req.params.id}`);
            return res.status(HttpCodes.OK).send({ data: tenantConfig[0], statusCode: HttpCodes.OK, message: null });
        }
        if (req.query.solutionType === 'wls') {
            const { cfrmApiGatewayURL, keycloakURL, cfrmUsername, cfrmPassword, cfrmClientID, cfrmGrantType } = tenantConfig[0];
            const token = await getCfrmToken(keycloakURL, cfrmUsername, cfrmPassword, cfrmClientID, cfrmGrantType);
            const tenants = await getWlsTenants(cfrmApiGatewayURL, token);
            console.log(`getAllTenants -- User:${req.user} Found ${tenants.length} tenants`);
            return res.status(HttpCodes.OK).send({ data: tenants, statusCode: HttpCodes.OK, message: null });
        } else {
            const { cfrmApiGatewayURL } = tenantConfig[0];
            const tenants = await getLegacyTenants(cfrmApiGatewayURL);
            console.log(`getAllTenants -- User:${req.user} Found ${tenants.length} tenants`);
            return res.status(HttpCodes.OK).send({ data: tenants, statusCode: HttpCodes.OK, message: null });
        }
    } catch (ex) {
        console.error(`getAllTenants -- User:${req.user} Error while trying  to get all tenants, Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get tenants' });
    }
};

const getUsersByTenantID = async (req, res, next) => {
    try {
        console.log(`getUsersByTenantID -- User:${req.user} Trying to get users for tenantID:${req.body.tenantID}`);
        const schema = joi.object().keys({
            tierID: joi.string().required(),
            tenantID: joi.string().required(),
            solutionType: joi.string().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`getUsersByTenantID -- User:${req.user} Error while Trying to get users for tenantID:${req.body.tenantID}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const tenantConfig = await Tenant.find({ tierID: req.body.tierID });
        if (!tenantConfig || !Array.isArray(tenantConfig) || tenantConfig.length === 0) {
            console.log(`getUsersByTenantID -- User:${req.user} not found tenant configuration for tierID:${req.body.tierID}`);
            return res.status(HttpCodes.OK).send({ data: tenantConfig[0], statusCode: HttpCodes.OK, message: null });
        }
        if (req.body.solutionType === 'wls') {
            const { keycloakURL, keycloakUsername, keycloakPassword, keycloakClientID, keycloakGrantType } = tenantConfig[0];
            const token = await getKeycloakToken(keycloakURL, keycloakUsername, keycloakPassword, keycloakClientID, keycloakGrantType);
            const users = await getTenantWlsUsers(keycloakURL, token, req.body.tenantID);
            return res.status(HttpCodes.OK).send({ data: users, statusCode: HttpCodes.OK, message: null });
        } else {
            const { dbUsername, dbPassword, dbHomePath, dbConnectionString } = tenantConfig[0];
            const users = await getTenanLegacyUsers(dbUsername, dbPassword, dbHomePath, dbConnectionString, req.body.tenantID);
            return res.status(HttpCodes.OK).send({ data: users, statusCode: HttpCodes.OK, message: null });
        }
    } catch (ex) {
        if (ex?.status === HttpCodes.NOT_FOUND) {
            return res.status(HttpCodes.NOT_FOUND).send({ data: null, statusCode: HttpCodes.NOT_FOUND, message: ex.message });
        }
        console.error(`getUsersByTenantID -- User:${req.user} Error while Trying to get users for tenantID:${req.body.tenantID}, Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get tenants users' });
    }
};

const getTenantConfigurationByTierID = async (req, res, next) => {
    try {
        console.log(`getTenantConfigurationByID -- User:${req.user} Trying to get tenant configuration for tierID:${req.params.id}`);
        const schema = joi.object().keys({
            id: joi.string().required()
        });
        const result = schema.validate(req.params);
        if (result.error) {
            console.error(`getTenantConfigurationByTierID -- User:${req.user} Trying to get tenant configuration for tierID:${req.params.id}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const tenantConfig = await Tenant.find({ tierID: req.params.id });
        if (tenantConfig && Array.isArray(tenantConfig) && tenantConfig.length > 0) {
            console.log(`getTenantConfigurationByID -- User:${req.user} found tenant configuration for tierID:${req.params.id}`);
            return res.status(HttpCodes.OK).send({ data: tenantConfig[0], statusCode: HttpCodes.OK, message: null });
        }
        console.log(`getTenantConfigurationByID -- User:${req.user} not found any tenant configuration for tierID:${req.params.id}`);
        return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getUsersByTenantID -- User:${req.user} Error while Trying to get users for tenantID:${req.params.id}, Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get tenants configuration' });
    }
};

const setTenantConfigurationByID = async (req, res, next) => {
    try {
        console.log(`setTenantConfigurationByID -- User:${req.user} Trying to get tenant configuration for tierID:${req.body.tierID}`);
        const schema = validateSchemaTenantConfiguration(req.body.solutionType);
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`setTenantConfigurationByID -- User:${req.user} Trying to set tenant configuration for tierID:${req.params.id}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        if (!req.body.checkConnection) {
            let data = {
                keycloakURL: req.body.keycloakURL,
                cfrmApiGatewayURL: req.body.cfrmApiGatewayURL,
                keycloakUsername: req.body.keycloakUsername,
                keycloakPassword: req.body.keycloakPassword,
                keycloakClientID: req.body.keycloakClientID,
                keycloakGrantType: req.body.keycloakGrantType,
                cfrmUsername: req.body.cfrmUsername,
                cfrmPassword: req.body.cfrmPassword,
                cfrmClientID: req.body.cfrmClientID,
                cfrmGrantType: req.body.cfrmGrantType,
                tierID: req.body.tierID,
                solutionType: req.body.solutionType
            };
            if (req.body.solutionType === 'legacy') {
                data = {
                    cfrmApiGatewayURL: req.body.cfrmApiGatewayURL,
                    tierID: req.body.tierID,
                    solutionType: req.body.solutionType,
                    dbUsername: req.body.dbUsername,
                    dbPassword: req.body.dbPassword,
                    dbConnectionString: req.body.dbConnectionString,
                    dbHomePath: req.body.dbHomePath,
                    apacheHostname: req.body.apacheHostname,
                    apachePort: req.body.apachePort,
                    apacheUsername: req.body.apacheUsername,
                    apachePassword: req.body.apachePassword
                };
            }
            const tenantConfig = await Tenant.findOneAndUpdate({ tierID: req.body.tierID }, data, { upsert: true, new: true });
            if (tenantConfig) {
                return res.status(HttpCodes.OK).send({ data: req.params, statusCode: HttpCodes.OK, message: null });
            }
            throw 'Tenant creation failed';
        } else {
            if (req.body.solutionType === 'wls') {
                const testConnectionObj = {
                    keycloak: true,
                    csApiGetway: true
                };
                try {
                    await getKeycloakToken(req.body.keycloakURL, req.body.keycloakUsername, req.body.keycloakPassword, req.body.keycloakClientID, req.body.keycloakGrantType);
                } catch (ex) {
                    testConnectionObj.keycloak = false;
                }
                try {
                    const cfrmToken = await getCfrmToken(req.body.keycloakURL, req.body.cfrmUsername, req.body.cfrmPassword, req.body.cfrmClientID, req.body.cfrmGrantType);
                    await getWlsTenants(req.body.cfrmApiGatewayURL, cfrmToken);
                } catch (ex) {
                    testConnectionObj.csApiGetway = false;
                }
                return res.status(HttpCodes.OK).send({ data: testConnectionObj, statusCode: HttpCodes.OK, message: null });
            } else {
                const testConnectionObj = {
                    csApiGetway: true,
                    db: true,
                    apacheds: true
                };
                try {
                    await getLegacyTenants(req.body.cfrmApiGatewayURL);
                } catch (ex) {
                    testConnectionObj.csApiGetway = false;
                }
                const isDbConnetionSuccess = await testConnection(req.body.dbHomePath, req.body.dbUsername, req.body.dbPassword, req.body.dbConnectionString);
                if (!isDbConnetionSuccess) {
                    testConnectionObj.db = false;
                }
                try {
                    const isAutenticated = await apacheDsConnection(req.body.apacheHostname, req.body.apachePort, req.body.apacheUsername, req.body.apachePassword);
                    if (!isAutenticated) {
                        testConnectionObj.apacheds = false;
                    }
                } catch (ex) {
                    testConnectionObj.apacheds = false;
                }
                return res.status(HttpCodes.OK).send({ data: testConnectionObj, statusCode: HttpCodes.OK, message: null });
            }
        }
    } catch (ex) {
        console.error(`setTenantConfigurationByID -- User:${req.user} Error while Trying to set configuration, Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to set configuration tenants' });
    }
};

const createUserByTenant = async (req, res, next) => {
    try {
        console.log(`createUserByTenant -- User:${req.user} Trying to get create user :${req.body.username} for tenantID:${req.body.tenantID}`);
        const schema = joi.object().keys({
            tenantID: joi.string().required(),
            tierID: joi.string().required(),
            username: joi.string().required(),
            firstName: joi.string().required().allow(null),
            lastName: joi.string().required().allow(null),
            email: joi.string().required().allow(null),
            enabled: joi.boolean().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`createUserByTenant -- User:${req.user} Trying to get create user :${req.body.username} for tenantID:${req.body.tenantID}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const tenantConfig = await Tenant.find({ tierID: req.body.tierID });
        if (!tenantConfig || !Array.isArray(tenantConfig) || tenantConfig.length === 0) {
            console.log(`createUserByTenant -- User:${req.user} not found tenant configuration for tierID:${req.body.tierID}`);
            return res.status(HttpCodes.OK).send({ data: tenantConfig[0], statusCode: HttpCodes.OK, message: null });
        }
        const { keycloakURL, keycloakUsername, keycloakPassword, keycloakClientID, keycloakGrantType } = tenantConfig[0];
        const token = await getKeycloakToken(keycloakURL, keycloakUsername, keycloakPassword, keycloakClientID, keycloakGrantType);
        const userResponse = await createUserInTenant(keycloakURL, token, req.body.tenantID, req.body.username, req.body.firstName, req.body.lastName, req.body.email, req.body.enabled);
        return res.status(HttpCodes.OK).send({ data: userResponse, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`createUserByTenant -- User:${req.user}  Trying to get create user :${req.body.username} for tenantID:${req.body.tenantID}, Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to update user' });
    }
};

const updateUserByTenant = async (req, res, next) => {
    try {
        console.log(`updateUserByTenant -- User:${req.user} Trying to get update user :${req.body.userID} for tenantID:${req.body.tenantID}`);
        const schema = joi.object().keys({
            userID: joi.string().required(),
            tenantID: joi.string().required(),
            tierID: joi.string().required(),
            firstName: joi.string().allow(''),
            lastName: joi.string().allow(''),
            email: joi.string().allow(''),
            enabled: joi.boolean(),
            solutionType: joi.string().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`updateUserByTenant -- User:${req.user} Trying to get update user :${req.body.userID} for tenantID:${req.body.tenantID}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const tenantConfig = await Tenant.find({ tierID: req.body.tierID });
        if (!tenantConfig || !Array.isArray(tenantConfig) || tenantConfig.length === 0) {
            console.log(`updateUserByTenant -- User:${req.user} not found tenant configuration for tierID:${req.body.tierID}`);
            return res.status(HttpCodes.OK).send({ data: tenantConfig[0], statusCode: HttpCodes.OK, message: null });
        }
        if (req.body.solutionType === 'wls') {
            const { keycloakURL, keycloakUsername, keycloakPassword, keycloakClientID, keycloakGrantType } = tenantConfig[0];
            const token = await getKeycloakToken(keycloakURL, keycloakUsername, keycloakPassword, keycloakClientID, keycloakGrantType);
            await updateUserDetailsWlsInTenant(keycloakURL, token, req.body.userID, req.body.tenantID, req.body.firstName, req.body.lastName, req.body.email, req.body.enabled);
        } else {
            const { dbConnectionString, dbUsername, dbPassword, dbHomePath } = tenantConfig[0];
            await updateUserDetailsLegacyInTenant(dbUsername, dbPassword, dbHomePath, dbConnectionString, req.body.tenantID, req.body.userID, req.body.enabled);
        }
        return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`updateUserByTenant -- User:${req.user}  Failed while trying to get update user :${req.body.userID} for tenantID:${req.body.tenantID}, Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to update user' });
    }
};

const updateUserPasswordByTenant = async (req, res, next) => {
    try {
        console.log(`updateUserPasswordByTenant -- User:${req.user} Trying to get update user :${req.body.userID} passord for tenantID:${req.body.tenantID}`);
        const schema = joi.object().keys({
            userID: joi.string().required(),
            tenantID: joi.string().required(),
            tierID: joi.string().required(),
            password: joi.string().required(),
            isTemporary: joi.boolean().required(),
            solutionType: joi.string().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`updateUserPasswordByTenant -- User:${req.user} Trying to get update user :${req.body.userID} password for tenantID:${req.body.tenantID}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const tenantConfig = await Tenant.find({ tierID: req.body.tierID });
        if (!tenantConfig || !Array.isArray(tenantConfig) || tenantConfig.length === 0) {
            console.log(`updateUserPasswordByTenant -- User:${req.user} not found tenant configuration for tierID:${req.body.tierID}`);
            return res.status(HttpCodes.OK).send({ data: tenantConfig[0], statusCode: HttpCodes.OK, message: null });
        }
        if (req.body.solutionType === 'wls') {
            const { keycloakURL, keycloakUsername, keycloakPassword, keycloakClientID, keycloakGrantType } = tenantConfig[0];
            const token = await getKeycloakToken(keycloakURL, keycloakUsername, keycloakPassword, keycloakClientID, keycloakGrantType);
            await updateUserPasswordWlsInTenant(keycloakURL, token, req.body.userID, req.body.tenantID, req.body.password, req.body.isTemporary);
        } else {
            const { apacheHostname, apachePassword, apacheUsername, apachePort } = tenantConfig[0];
            await updateUserPasswordLegacyInTenant(apacheHostname, apacheUsername, apachePassword, apachePort, req.body.tenantID, req.body.userID, req.body.password);
        }

        return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`updateUserPasswordByTenant -- User:${req.user}  Failed while trying to get update user :${req.body.userID} password for tenantID:${req.body.tenantID}, Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to update user password' });
    }
};

const deleteUserByTenant = async (req, res, next) => {
    try {
        console.log(`DeleteUserByTenant -- User:${req.user} Trying to delete user :${req.body.userID} from tenantID:${req.body.tenantID}`);
        const schema = joi.object().keys({
            userID: joi.string().required(),
            tenantID: joi.string().required(),
            tierID: joi.string().required(),
            solutionType: joi.string().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`DeleteUserByTenant -- User:${req.user} delete user :${req.body.userID} from tenantID:${req.body.tenantID}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const tenantConfig = await Tenant.find({ tierID: req.body.tierID });
        if (!tenantConfig || !Array.isArray(tenantConfig) || tenantConfig.length === 0) {
            console.log(`DeleteUserByTenant -- User:${req.user} not found tenant configuration for tierID:${req.body.tierID}`);
            return res.status(HttpCodes.OK).send({ data: tenantConfig[0], statusCode: HttpCodes.OK, message: null });
        }
        if (req.body.solutionType === 'wls') {
            const { keycloakURL, keycloakUsername, keycloakPassword, keycloakClientID, keycloakGrantType } = tenantConfig[0];
            const token = await getKeycloakToken(keycloakURL, keycloakUsername, keycloakPassword, keycloakClientID, keycloakGrantType);
            await deleteWlsUserInTenant(keycloakURL, token, req.body.userID, req.body.tenantID);
        } else {
            const { dbConnectionString, dbUsername, dbPassword, dbHomePath, apacheHostname, apachePassword, apacheUsername, apachePort } = tenantConfig[0];
            await deleteLegacyUserInTenant(dbUsername, dbPassword, dbHomePath, dbConnectionString, apacheHostname, apacheUsername, apachePassword, apachePort, req.body.tenantID, req.body.userID);
        }

        return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`DeleteUserByTenant -- User:${req.user}  Failed while trying to get delete user :${req.body.userID} from tenantID:${req.body.tenantID}, Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to delete user' });
    }
};

const deleteTenant = async (req, res, next) => {
    try {
        console.log(`deleteTenant -- User:${req.user} Trying to delete tenantID:${req.body.tenantID}`);
        const schema = joi.object().keys({
            tenantID: joi.string().required(),
            tierID: joi.string().required(),
            solutionType: joi.string().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`deleteTenant -- User:${req.user} delete tenantID:${req.body.tenantID}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const tenantConfig = await Tenant.find({ tierID: req.body.tierID });
        if (!tenantConfig || !Array.isArray(tenantConfig) || tenantConfig.length === 0) {
            console.log(`deleteTenant -- User:${req.user} not found tenant configuration for tierID:${req.body.tierID}`);
            return res.status(HttpCodes.OK).send({ data: tenantConfig[0], statusCode: HttpCodes.OK, message: null });
        }
        if (req.body.solutionType === 'wls') {
            const { keycloakURL, keycloakUsername, keycloakPassword, keycloakClientID, keycloakGrantType } = tenantConfig[0];
            await getKeycloakToken(keycloakURL, keycloakUsername, keycloakPassword, keycloakClientID, keycloakGrantType);
            return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
        } else {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
            const { cfrmApiGatewayURL } = tenantConfig[0];
            await deleteLegacyTenant(cfrmApiGatewayURL, req.body.tenantID);
            return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
        }
    } catch (ex) {
        if (ex.statusCode === HttpCodes.BAD_REQUEST) {
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: ex.message });
        }
        console.error(`deleteTenant -- User:${req.user} Failed while trying to get delete tenantID:${req.body.tenantID}, Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to delete user' });
    }
};

const editTenant = async (req, res, next) => {
    try {
        console.log(`editTenant -- User:${req.user} Trying to edit tenantID:${req.body.tenantID}`);
        const schema = joi.object().keys({
            tenantID: joi.string().required(),
            tierID: joi.string().required(),
            solutionType: joi.string().required(),
            description: joi.string().required().allow(null),
            displayName: joi.string().required().allow(''),
            status: joi.boolean().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`editTenant -- User:${req.user} edit tenantID:${req.body.tenantID}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const tenantConfig = await Tenant.find({ tierID: req.body.tierID });
        if (!tenantConfig || !Array.isArray(tenantConfig) || tenantConfig.length === 0) {
            console.log(`editTenant -- User:${req.user} not found tenant configuration for tierID:${req.body.tierID}`);
            return res.status(HttpCodes.OK).send({ data: tenantConfig[0], statusCode: HttpCodes.OK, message: null });
        }
        const tenantObjName = {
            tenantID: req.body.tenantID,
            tenantDisplayName: req.body.displayName
        };
        if (req.body.solutionType === 'wls') {
            const { keycloakURL } = tenantConfig[0];
            const { cfrmApiGatewayURL, cfrmUsername, cfrmPassword, cfrmClientID, cfrmGrantType } = tenantConfig[0];
            const cfrmToken = await getCfrmToken(keycloakURL, cfrmUsername, cfrmPassword, cfrmClientID, cfrmGrantType);
            await createTenantOnInvestigationCenter(cfrmApiGatewayURL, cfrmToken, tenantObjName, req.body.description, req.body.status);
            await updateTenantPropertiesOnInvestigationCenter(cfrmApiGatewayURL, cfrmToken, tenantObjName);
            return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
        } else {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
            const { cfrmApiGatewayURL } = tenantConfig[0];
            await createTenantOnInvestigationCenter(cfrmApiGatewayURL, null, tenantObjName, req.body.description, req.body.status);
            await updateTenantPropertiesOnInvestigationCenter(cfrmApiGatewayURL, null, tenantObjName);
            return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
        }
    } catch (ex) {
        console.error(`editTenant -- User:${req.user} Trying to edit tenantID:${req.body.tenantID}, Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to edit tenant' });
    }
};

const getGroupsByTenant = async (req, res, next) => {
    try {
        console.log(`getTenantGroups -- User:${req.user} Trying to get tenant groups for tenantID:${req.body.tenantID}`);
        const schema = joi.object().keys({
            userID: joi.string().required(),
            tenantID: joi.string().required(),
            tierID: joi.string().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`getTenantGroups -- User:${req.user} Trying to get tenant groups for tenantID:${req.body.tenantID}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const tenantConfig = await Tenant.find({ tierID: req.body.tierID });
        if (!tenantConfig || !Array.isArray(tenantConfig) || tenantConfig.length === 0) {
            console.log(`getTenantGroups -- User:${req.user} not found tenant configuration for tierID:${req.body.tierID}`);
            return res.status(HttpCodes.OK).send({ data: tenantConfig[0], statusCode: HttpCodes.OK, message: null });
        }
        const { keycloakURL, keycloakUsername, keycloakPassword, keycloakClientID, keycloakGrantType } = tenantConfig[0];
        const token = await getKeycloakToken(keycloakURL, keycloakUsername, keycloakPassword, keycloakClientID, keycloakGrantType);
        const promises = [
            getTenantGroups(keycloakURL, token, req.body.tenantID),
            getTenantGroupsOfUser(keycloakURL, token, req.body.tenantID, req.body.userID)
        ];
        const promiseRes = await Promise.all(promises);
        const availableGroups = promiseRes[0].filter(({ id }) => !promiseRes[1].find(o => o.id === id));
        const results = [availableGroups, promiseRes[1]];
        return res.status(HttpCodes.OK).send({ data: results, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`updateUserPasswordByTenant -- User:${req.user} Failed while trying to get delete user :${req.body.userID} from tenantID:${req.body.tenantID}, Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to delete user' });
    }
};

const manageUserWithGroupsByTenatID = async (req, res, next) => {
    try {
        console.log(`manageUserWithGroupsByTenatID -- User:${req.user} Trying to :${req.body.action} user:${req.body.userID} to group:${req.body.groupID} for tenantID:${req.body.tenantID}`);
        const schema = joi.object().keys({
            userID: joi.string().required(),
            groupIDs: joi.array().required(),
            tenantID: joi.string().required(),
            tierID: joi.string().required(),
            action: joi.string().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`manageUserWithGroupsByTenatID -- User:${req.user}  Trying to :${req.body.action} user:${req.body.userID} to group:${req.body.groupID} for tenantID:${req.body.tenantID}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const tenantConfig = await Tenant.find({ tierID: req.body.tierID });
        if (!tenantConfig || !Array.isArray(tenantConfig) || tenantConfig.length === 0) {
            console.log(`manageUserWithGroupsByTenatID -- User:${req.user} not found tenant configuration for tierID:${req.body.tierID}`);
            return res.status(HttpCodes.OK).send({ data: tenantConfig[0], statusCode: HttpCodes.OK, message: null });
        }
        const { keycloakURL, keycloakUsername, keycloakPassword, keycloakClientID, keycloakGrantType } = tenantConfig[0];
        const token = await getKeycloakToken(keycloakURL, keycloakUsername, keycloakPassword, keycloakClientID, keycloakGrantType);
        const promises = [];
        for (const groupID of req.body.groupIDs) {
            promises.push(manageUserWithGroup(keycloakURL, token, req.body.userID, groupID, req.body.tenantID, req.body.action));
        }
        await Promise.allSettled(promises);
        return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`manageUserWithGroupsByTenatID -- User:${req.user}  Trying to :${req.body.action} user:${req.body.userID} to group:${req.body.groupID} for tenantID:${req.body.tenantID}, Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to manage user groups' });
    }
};

const createNewTenant = async (req, res, next) => {
    try {
        console.log(`createNewTenant -- Trying to create new tenant:${req.body.name} for tierID:${req.body.tierID} on source:${req.body.source}`);
        const schema = joi.object().keys({
            name: joi.string().required(),
            tierID: joi.string().required(),
            description: joi.string().required(),
            status: joi.boolean().required(),
            source: joi.string().required(),
            solutionType: joi.string().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`createNewTenant -- User:${req.user} Trying to create new tenant:${req.body.name} for tierID:${req.body.tierID} on source:${req.body.source}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const tenantConfig = await Tenant.find({ tierID: req.body.tierID });
        if (!tenantConfig || !Array.isArray(tenantConfig) || tenantConfig.length === 0) {
            console.log(`createNewTenant -- User:${req.user} not found tenant configuration for tierID:${req.body.tierID}`);
            return res.status(HttpCodes.OK).send({ data: tenantConfig[0], statusCode: HttpCodes.OK, message: null });
        }
        const tenantObjName = parseTenantsParams(req.body.name);
        const responses = [];
        if (req.body.solutionType === 'wls') {
            const { keycloakURL } = tenantConfig[0];
            const { cfrmApiGatewayURL, cfrmUsername, cfrmPassword, cfrmClientID, cfrmGrantType } = tenantConfig[0];
            const cfrmToken = await getCfrmToken(keycloakURL, cfrmUsername, cfrmPassword, cfrmClientID, cfrmGrantType);
            if (req.body.source === 'keycloak') {
                const keycloackResponse = await createTenantOnKeycloak(cfrmApiGatewayURL, cfrmToken, tenantObjName, req.body.status);
                responses.push({ step: 'keycloak', isCreated: keycloackResponse.isCreated, message: keycloackResponse.message });
                return res.status(HttpCodes.OK).send({ data: responses, statusCode: HttpCodes.OK, message: null });
            }
            if (req.body.source === 'wls') {
                const wlsCreateResponse = await createTenantOnWls(cfrmApiGatewayURL, cfrmToken, tenantObjName);
                responses.push({ step: 'wls', isCreated: wlsCreateResponse.isCreated, message: wlsCreateResponse?.message });
                if (wlsCreateResponse.isCreated) {
                    const wlsPatchResponse = await patchTenantOnWls(cfrmApiGatewayURL, cfrmToken, tenantObjName, req.body.status);
                    responses.push({ step: 'wls-update', isCreated: wlsPatchResponse.isCreated, message: wlsPatchResponse?.message });
                } else {
                    responses.push({ step: 'wls-update', isCreated: false });
                }
                return res.status(HttpCodes.OK).send({ data: responses, statusCode: HttpCodes.OK, message: null });
            } else {
                const icCreateResponse = await createTenantOnInvestigationCenter(cfrmApiGatewayURL, cfrmToken, tenantObjName, req.body.description, req.body.status);
                responses.push({ step: 'ic', isCreated: icCreateResponse.isCreated, message: icCreateResponse.message });
                if (icCreateResponse.isCreated) {
                    const icUpdateResponse = await updateTenantPropertiesOnInvestigationCenter(cfrmApiGatewayURL, cfrmToken, tenantObjName);
                    responses.push({ step: 'ic-update', isCreated: icUpdateResponse.isCreated, message: icUpdateResponse?.message });
                } else {
                    responses.push({ step: 'ic-update', isCreated: false });
                }
                return res.status(HttpCodes.OK).send({ data: responses, statusCode: HttpCodes.OK, message: null });
            }
        } else {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
            const { cfrmApiGatewayURL } = tenantConfig[0];
            const icCreateResponse = await createTenantOnInvestigationCenter(cfrmApiGatewayURL, null, tenantObjName, req.body.description, req.body.status);
            responses.push({ step: 'ic', isCreated: icCreateResponse.isCreated, message: icCreateResponse.message });
            const icActivateResponse = await createTenantOnInvestigationCenter(cfrmApiGatewayURL, null, tenantObjName, req.body.description, req.body.status);
            responses.push({ step: 'ic-activate', isCreated: icActivateResponse.isCreated, message: icActivateResponse.message });
            if (icActivateResponse.isCreated) {
                const icUpdateResponse = await updateTenantPropertiesOnInvestigationCenter(cfrmApiGatewayURL, null, tenantObjName);
                responses.push({ step: 'ic-update', isCreated: icUpdateResponse.isCreated, message: icUpdateResponse?.message });
            } else {
                responses.push({ step: 'ic-update', isCreated: false });
            }
            return res.status(HttpCodes.OK).send({ data: responses, statusCode: HttpCodes.OK, message: null });
        }
    } catch (ex) {
        console.error(`createNewTenant -- User:${req.user} create new tenant:${req.body.name} for tierID:${req.body.tierID} on source:${req.body.source}, Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Failed to create new tenant on source:${req.body.source}` });
    }
};

export default {
    getAllTenants,
    getUsersByTenantID,
    createUserByTenant,
    updateUserByTenant,
    updateUserPasswordByTenant,
    deleteUserByTenant,
    deleteTenant,
    editTenant,
    getGroupsByTenant,
    manageUserWithGroupsByTenatID,
    getTenantConfigurationByTierID,
    setTenantConfigurationByID,
    createNewTenant
};
