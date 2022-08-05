import axios from 'axios';
import qs from 'qs';
import joi from 'joi';
import shell from 'shelljs';
import { LIST_IDS_WLS, IC_TENANT_PROPERTIES } from '../config/tenants.js';
import HttpCodes from '../../../shared/http-status-codes.js';
import { executeQuery, getConnection } from '../../../shared/oracledb.js';

export const validateSchemaTenantConfiguration = (solutionType) => {
    let schema = joi.object().keys({
        tierID: joi.string().required(),
        keycloakURL: joi.string().required(),
        cfrmApiGatewayURL: joi.string().required(),
        keycloakUsername: joi.string().required(),
        keycloakPassword: joi.string().required(),
        keycloakClientID: joi.string().required(),
        keycloakGrantType: joi.string().required(),
        cfrmUsername: joi.string().required(),
        cfrmPassword: joi.string().required(),
        cfrmClientID: joi.string().required(),
        cfrmGrantType: joi.string().required(),
        checkConnection: joi.boolean().required(),
        solutionType: joi.string().required()
    });
    if (solutionType === 'legacy') {
        schema = joi.object().keys({
            tierID: joi.string().required(),
            cfrmApiGatewayURL: joi.string().required(),
            checkConnection: joi.boolean().required(),
            solutionType: joi.string().required(),
            dbUsername: joi.string().required(),
            dbPassword: joi.string().required(),
            dbConnectionString: joi.string().required(),
            dbHomePath: joi.string().required(),
            apacheHostname: joi.string().required(),
            apachePort: joi.string().required(),
            apacheUsername: joi.string().required(),
            apachePassword: joi.string().required()
        });
    }
    return schema;
};

export const getKeycloakToken = async (keycloakURL, username, password, clientID, grantType) => {
    try {
        console.log('getKeycloakToken -- Trying to get token');
        const data = qs.stringify({
            username: username,
            password: password,
            grant_type: grantType,
            client_id: clientID
        });
        const config = {
            method: 'POST',
            url: `${keycloakURL}/auth/realms/master/protocol/openid-connect/token`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };
        const res = await axios(config);
        if (res?.status === HttpCodes.OK && res?.data?.access_token) {
            return res?.data?.access_token;
        }
        throw JSON.stringify(res);
    } catch (ex) {
        const err = `getKeycloakToken -- Error while trying to get Keycloak token, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const getCfrmToken = async (keycloakURL, username, password, clientID, grantType) => {
    try {
        console.log('getCfrmToken -- Trying to get token');
        const data = qs.stringify({
            username: username,
            password: password,
            grant_type: grantType,
            client_id: clientID
        });
        const config = {
            method: 'POST',
            url: `${keycloakURL}/auth/realms/cfrm/protocol/openid-connect/token`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };
        const res = await axios(config);
        if (res?.status === HttpCodes.OK && res?.data?.access_token) {
            return res?.data?.access_token;
        }
        throw JSON.stringify(res);
    } catch (ex) {
        const err = `getCfrmToken -- Error while trying to get CFRM token, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const apacheDsConnection = async (hostname, port, username, password) => {
    try {
        const response = shell.exec(`ldapwhoami -h ${hostname} -p ${port} -D ${username} -w ${password}`);
        if (response.stderr) {
            return false;
        }
        return true;
    } catch (ex) {
        const err = `apacheDsConnection -- Error while trying to check apacheds connection, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const getWlsTenants = async (cfrmApiGatewayURL, token) => {
    try {
        const icUrl = getIcUrl(cfrmApiGatewayURL);
        const res = await axios.get(`${icUrl}/InvestigationCenter/api/REST/tenantManagement/getTenants`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        if (res?.status === HttpCodes.OK && res?.data) {
            const tenants = [];
            for (const tenant of res?.data) {
                tenants.push({
                    tenantID: tenant.tenantId,
                    displayName: tenant.displayName,
                    description: tenant.description,
                    status: tenant.status,
                    properties: tenant.properties

                });
            }
            return tenants;
        }
        throw JSON.stringify(res);
    } catch (ex) {
        const err = `getTenants -- Error while trying to get tenant , Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const getLegacyTenants = async (cfrmApiGatewayURL) => {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        const res = await axios.get(`${cfrmApiGatewayURL}/InvestigationCenter/api/REST/tenantManagement/getTenants`);
        if (res?.status === HttpCodes.OK && res?.data && Array.isArray(res.data)) {
            const tenants = [];
            for (const tenant of res?.data) {
                tenants.push({
                    tenantID: tenant.tenantId,
                    displayName: tenant.displayName,
                    description: tenant.description,
                    status: tenant.status,
                    properties: tenant.properties

                });
            }
            return tenants;
        }
        throw JSON.stringify(res);
    } catch (ex) {
        const err = `getTenants -- Error while trying to get tenant , Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const getTenantWlsUsers = async (keycloakURL, token, tenantID) => {
    try {
        const res = await axios.get(`${keycloakURL}/auth/admin/realms/${tenantID}/users`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        if (res?.status === HttpCodes.OK && res?.data) {
            const users = [];
            for (const user of res?.data) {
                let name = null;
                if (user.firstName) name = user.firstName;
                if (user.lastName) name = name + ' ' + user.lastName;
                users.push({
                    id: user.id,
                    username: user.username,
                    enabled: user.enabled,
                    name: name,
                    email: user.email,
                    createdTimestamp: user.createdTimestamp
                });
            }
            return users;
        }
        throw JSON.stringify(res);
    } catch (ex) {
        if (ex?.response?.status === HttpCodes.NOT_FOUND) {
            console.error(`getTenantUsers -- Error while trying to get tenants users, Error:TenantID :${tenantID} is not exist in keycloack`);
            throw {
                status: HttpCodes.NOT_FOUND, message: `TenantID :${tenantID} is not exist in keycloack`
            };
        }
        const err = `getTenantUsers -- Error while trying to get tenants users, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const getTenanLegacyUsers = async (username, password, homePath, connectionString, tenantID) => {
    try {
        const query = 'select * from ic_principals where tenant_id = :id and principal_type = \'USER\'';
        const params = [tenantID];
        const connection = await getConnection(homePath, username, password, connectionString);
        const usersQueryResponse = await executeQuery(connection, query, params);
        const users = [];
        if (usersQueryResponse?.rows) {
            for (const row of usersQueryResponse?.rows) {
                users.push({
                    id: null,
                    username: row.PRINCIPAL_NAME,
                    enabled: row.ACTIVE,
                    name: row.DISPLAY_NAME,
                    email: row.EMAIL,
                    createdTimestamp: null
                });
            }
            return users;
        } else {
            return [];
        }
    } catch (ex) {
        const err = `getTenantUsers -- Error while trying to get tenants users, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const createUserInTenant = async (keycloakURL, token, tenantID, username, firstName, lastName, email, enabled) => {
    try {
        const data = {
            username: username
        };
        if (firstName) data.firstName = firstName;
        if (lastName) data.lastName = lastName;
        if (email) data.email = email;
        if (enabled === true || enabled === false) data.enabled = enabled;

        const res = await axios.post(`${keycloakURL}/auth/admin/realms/${tenantID}/users`, data,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        if (res?.status === HttpCodes.CREATED) {
            console.log(`createUserInTenant -- Succeeded to create user:${username} on tenantID:${tenantID}`);
            const userDetails = await axios.get(`${keycloakURL}/auth/admin/realms/${tenantID}/users?username=${username}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            if (userDetails?.status === HttpCodes.OK && userDetails?.data && Array.isArray(userDetails.data) && userDetails.data.length > 0) {
                return userDetails.data[0];
            }
        }
        throw JSON.stringify(res);
    } catch (ex) {
        const err = `createUserInTenant -- Failed to create user:${username} on tenantID:${tenantID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const updateUserDetailsWlsInTenant = async (keycloakURL, token, userID, tenantID, firstName, lastName, email, enabled) => {
    try {
        const data = {};
        if (firstName) data.firstName = firstName;
        if (lastName) data.lastName = lastName;
        if (email) data.email = email;
        if (enabled === true || enabled === false) data.enabled = enabled;

        const res = await axios.put(`${keycloakURL}/auth/admin/realms/${tenantID}/users/${userID}`, data,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        if (res?.status === HttpCodes.NO_CONTENT) {
            console.log(`updateUserDetailsWlsInTenant -- Succeeded to update user:${userID} details on tenantID:${tenantID}`);
            return;
        }
        throw JSON.stringify(res);
    } catch (ex) {
        const err = `updateUserDetailsWlsInTenant -- Failed to update user:${userID} details on tenantID:${tenantID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const updateUserDetailsLegacyInTenant = async (dbUsername, dbPassword, dbHomePath, dbConnectionString, tenantID, userID, enabled) => {
    try {
        let connection;
        try {
            const isActive = enabled === true ? '1' : '0';
            const query = 'update ic_principals set ACTIVE = :enabled where tenant_id = :id and PRINCIPAL_NAME = :username and principal_type = \'USER\' ';
            const params = [isActive, tenantID, userID];
            connection = await getConnection(dbHomePath, dbUsername, dbPassword, dbConnectionString);
            const usersQueryResponse = await executeQuery(connection, query, params, false);
            if (usersQueryResponse?.rowsAffected === 1) {
                console.log(`updateUserDetailsLegacyInTenant -- Succeeded to update user:${userID} on tenantID:${tenantID} on db`);
            } else {
                console.log(`updateUserDetailsLegacyInTenant -- User:${userID} already updated on tenantID:${tenantID} on db`);
            }
            await connection.commit();
            await connection.close();
        } catch (ex) {
            if (connection) {
                await connection.rollback();
                await connection.close();
            }
            const err = `updateUserDetailsLegacyInTenant -- Failed to update user:${userID} details on tenantID:${tenantID}, Error: ${JSON.stringify(ex)}`;
            console.error(err);
            throw err;
        }
    } catch (ex) {
        const err = `updateUserDetailsLegacyInTenant -- Failed to update user:${userID} details on tenantID:${tenantID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const updateUserPasswordWlsInTenant = async (keycloakURL, token, userID, tenantID, password, isTemporary) => {
    try {
        const data = {
            temporary: isTemporary,
            type: 'password',
            value: password
        };
        const res = await axios.put(`${keycloakURL}/auth/admin/realms/${tenantID}/users/${userID}/reset-password`, data,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        if (res?.status === HttpCodes.NO_CONTENT) {
            console.log(`updateUserPasswordWlsInTenant -- Succeeded to update user:${userID} password on tenantID:${tenantID}`);
            return;
        }
        throw JSON.stringify(res);
    } catch (ex) {
        const err = `updateUserPasswordWlsInTenant -- Failed to update user:${userID} password on tenantID:${tenantID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const updateUserPasswordLegacyInTenant = async (apacheHostname, apacheUsername, apachePassword, apachePort, tenantID, userID, password) => {
    try {
        const response = shell.exec(`ldappasswd -h ${apacheHostname} -p ${apachePort} -x -D ${apacheUsername} -w ${apachePassword} -s ${password} uid=${userID},ou=users,ou=system`);
        if (!response.stdout && response.stderr.includes('ber_scanf')) {
            console.log(`updateUserPasswordLegacyInTenant -- Succeeded to update user:${userID} password on tenantID:${tenantID}`);
            return;
        } else {
            console.error(`updateUserPasswordLegacyInTenant -- failed to update user:${userID} password on tenantID:${tenantID},Error:${response.stdout}`);
            throw response.stdout + ',Error:' + response.stderr;
        }
    } catch (ex) {
        const err = `updateUserPasswordLegacyInTenant -- Failed to update user:${userID} password on tenantID:${tenantID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const deleteWlsUserInTenant = async (keycloakURL, token, userID, tenantID) => {
    try {
        const res = await axios.delete(`${keycloakURL}/auth/admin/realms/${tenantID}/users/${userID}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        if (res?.status === HttpCodes.NO_CONTENT) {
            console.log(`deleteWlsUserInTenant -- Succeeded to delete user:${userID} on tenantID:${tenantID}`);
            return;
        }
        throw JSON.stringify(res);
    } catch (ex) {
        const err = `deleteWlsUserInTenant -- Failed to delete user:${userID} on tenantID:${tenantID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const deleteLegacyUserInTenant = async (dbUsername, dbPassword, homePath, connectionString, apacheHostname, apacheUsername, apachePassword, apachePort, tenantID, tenantUsername) => {
    let connection;
    try {
        const query = 'delete from ic_principals where tenant_id = :id and PRINCIPAL_NAME = :username and principal_type = \'USER\'';
        const params = [tenantID, tenantUsername];
        connection = await getConnection(homePath, dbUsername, dbPassword, connectionString);
        const usersQueryResponse = await executeQuery(connection, query, params, false);
        if (usersQueryResponse?.rowsAffected === 1) {
            console.log(`deleteLegacyUserInTenant -- Succeeded to delete user:${tenantUsername} on tenantID:${tenantID} on db`);
        } else {
            console.log(`deleteLegacyUserInTenant -- User:${tenantUsername} already deleted on tenantID:${tenantID} on db`);
        }
        const response = shell.exec(`ldapdelete -h ${apacheHostname} -p ${apachePort} -D ${apacheUsername} -w ${apachePassword} uid=${tenantUsername},ou=users,ou=system`);
        if (response.stderr && !response.stderr.includes('non-existant entry')) {
            throw 'Failed to delete user apacheds';
        } else {
            console.log(`deleteLegacyUserInTenant -- Succeeded to delete user:${tenantUsername} on tenantID:${tenantID} on apacheds`);
        };
        await connection.commit();
        await connection.close();
    } catch (ex) {
        if (connection) {
            await connection.rollback();
            await connection.close();
        }
        const err = `deleteLegacyUserInTenant -- Failed to delete user:${tenantUsername} on tenantID:${tenantID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const deleteLegacyTenant = async (cfrmApiGatewayURL, tenantID) => {
    try {
        const res = await axios.delete(`${cfrmApiGatewayURL}/InvestigationCenter/api/REST/tenantManagement/deleteTenant/${tenantID}`);
        if (res?.status === HttpCodes.OK) {
            console.log(`deleteLegacyTenant -- Succeeded to delete tenantID:${tenantID}`);
            return;
        }
        throw JSON.stringify(res);
    } catch (ex) {
        if (ex?.response?.status === HttpCodes.BAD_REQUEST && ex?.response?.data?.message) {
            throw {
                statusCode: HttpCodes.BAD_REQUEST,
                message: ex.response.data.message
            };
        }
        const err = `deleteUserInTenant -- Failed to delete tenantID:${tenantID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const getTenantGroups = async (keycloakURL, token, tenantID) => {
    try {
        const res = await axios.get(`${keycloakURL}/auth/admin/realms/${tenantID}/groups`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        if (res?.status === HttpCodes.OK) {
            console.log(`getTenantGroups -- Succeeded to get tenant groups for tenantID:${tenantID}`);
            return res.data;
        }
        throw JSON.stringify(res);
    } catch (ex) {
        const err = `getTenantGroups -- Failed to get tenant groups for tenantID:${tenantID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const getTenantGroupsOfUser = async (keycloakURL, token, tenantID, userID) => {
    try {
        const res = await axios.get(`${keycloakURL}/auth/admin/realms/${tenantID}/users/${userID}/groups`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        if (res?.status === HttpCodes.OK) {
            console.log(`getTenantGroupsOfUser -- Succeeded to get tenant groups for tenantID:${tenantID} of user:${userID}`);
            return res.data;
        }
        throw JSON.stringify(res);
    } catch (ex) {
        const err = `getTenantGroupsOfUser -- Failed to get tenant groups for tenantID:${tenantID} of user:${userID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const manageUserWithGroup = async (keycloakURL, token, userID, groupID, tenantID, action) => {
    try {
        const config = {
            method: action === 'add' ? 'put' : 'delete',
            url: `${keycloakURL}/auth/admin/realms/${tenantID}/users/${userID}/groups/${groupID}`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: {
                groupId: groupID,
                realm: tenantID,
                userId: userID
            }
        };
        const res = await axios(config);
        if (res?.status === HttpCodes.NO_CONTENT) {
            console.log(`manageUserWithGroup -- Succeeded to ${action} user:${userID} for groupID:${groupID} fortenantID:${tenantID}`);
            return true;
        }
        throw JSON.stringify(res);
    } catch (ex) {
        const err = `manageUserWithGroup -- Failed to${action} user:${userID} for groupID:${groupID} fortenantID:${tenantID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const createTenantOnKeycloak = async (cfrmApiGatewayURL, token, nameObj, enabled) => {
    try {
        const icUrl = getIcUrl(cfrmApiGatewayURL);
        const data = {
            realmName: nameObj.tenantID,
            displayName: nameObj.tenantDisplayName,
            displayNameHtml: nameObj.tenantDisplayName,
            active: enabled
        };
        const res = await axios.post(`${icUrl}/keycloak-management/realms/`, data,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        if (res?.status === HttpCodes.CREATED) {
            console.log(`createTenantOnKeycloak -- Succeeded to create tenant on keycloak:${nameObj.tenantID}`);
            return {
                isCreated: true,
                data: res.data
            };
        }
        throw JSON.stringify(res);
    } catch (ex) {
        if (ex?.response?.status === HttpCodes.CONFLICT) {
            console.log(`createTenantOnKeycloak --tenant on keycloak:${nameObj.tenantID} is already exist`);
            return {
                isCreated: true,
                data: null
            };
        }
        const err = `createTenantOnKeycloak -- Failed to create tenant on keycloak:${nameObj.tenantID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        let message = `Status:${ex?.response?.status}`;
        if (ex?.response?.data?.message) {
            message = `Status:${ex?.response?.status}, Message:${JSON.stringify(ex?.response?.data?.message)}`;
        }
        return {
            isCreated: false,
            data: null,
            message: message
        };
    }
};

export const createTenantOnWls = async (cfrmApiGatewayURL, token, nameObj) => {
    try {
        const data = {
            tenantID: nameObj.tenantID,
            tenantDisplayName: nameObj.tenantDisplayName
        };
        const res = await axios.post(`${cfrmApiGatewayURL}/tenants`, data,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        if (res?.status === HttpCodes.CREATED) {
            console.log(`createTenantOnWls -- Succeeded to create tenant on wls:${nameObj.tenantID}`);
            return {
                isCreated: true,
                data: res.data
            };
        }
        throw JSON.stringify(res);
    } catch (ex) {
        if (ex?.response?.status === 422 || ex?.response?.status === HttpCodes.CONFLICT) {
            console.log(`createTenantOnWls --tenant on wls:${nameObj.tenantID} is already exist`);
            return {
                isCreated: true,
                data: null
            };
        }
        const err = `createTenantOnWls -- Failed to create tenant on wls:${nameObj.tenantID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        let message = `Status:${ex?.response?.status}`;
        if (ex?.response?.data?.message) {
            message = `Status:${ex?.response?.status}, Message:${JSON.stringify(ex?.response?.data?.message)}`;
        }
        return {
            isCreated: false,
            data: null,
            message: message
        };
    }
};

export const patchTenantOnWls = async (cfrmApiGatewayURL, token, nameObj, status) => {
    try {
        const data = {
            tenantDisplayName: nameObj.tenantDisplayName,
            status: status ? 'ACTIVE' : 'INACTIVE',
            listIDs: LIST_IDS_WLS,
            watchlistsEntitlement: true
        };
        const res = await axios.patch(`${cfrmApiGatewayURL}/tenants/${nameObj.tenantID}`, data,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        if (res?.status === HttpCodes.OK) {
            console.log(`patchTenantOnWls -- Succeeded to patch tenant on wls:${nameObj.tenantID}`);
            return {
                isCreated: true,
                data: res.data
            };
        }
        throw JSON.stringify(res);
    } catch (ex) {
        if (ex?.response?.status === 422 || ex?.response?.status === HttpCodes.CONFLICT) {
            console.log(`patchTenantOnWls --tenant on wls:${nameObj.tenantID} is already exist`);
            return {
                isCreated: true,
                data: null
            };
        }
        const err = `patchTenantOnWls -- Failed to patch tenant on wls:${nameObj.tenantID}, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        let message = `Status:${ex?.response?.status}`;
        if (ex?.response?.data?.message) {
            message = `Status:${ex?.response?.status}, Message:${JSON.stringify(ex?.response?.data?.message)}`;
        }
        return {
            isCreated: false,
            data: null,
            message: message
        };
    }
};

export const createTenantOnInvestigationCenter = async (cfrmApiGatewayURL, token, nameObj, description, status) => {
    try {
        const data = {
            tenantId: nameObj.tenantID,
            tenantCode: nameObj.tenantID,
            displayName: nameObj.tenantDisplayName,
            description: description,
            caTenantId: nameObj.tenantID,
            status: status ? 'ACTIVE' : 'INACTIVE'
        };
        let headers = null;
        let uri = `${cfrmApiGatewayURL}/InvestigationCenter/api/REST/tenantManagement/saveTenant`;
        if (token) {
            headers = { Authorization: `Bearer ${token}` };
            const icUrl = getIcUrl(cfrmApiGatewayURL);
            uri = `${icUrl}/InvestigationCenter/api/REST/tenantManagement/saveTenant`;
        }
        const res = await axios.put(uri, data, { headers: headers });
        if (res?.status === HttpCodes.OK) {
            console.log(`createTenantOnInvestigationCenter -- Succeeded to create tenant on ic:${nameObj.tenantID}`);
            return {
                isCreated: true,
                data: res.data
            };
        }
        throw JSON.stringify(res);
    } catch (ex) {
        if (ex?.response?.status === HttpCodes.CONFLICT) {
            console.log(`createTenantOnInvestigationCenter --tenant on IC:${nameObj.tenantID} is already exist`);
            return {
                isCreated: false,
                data: null
            };
        }
        const err = `createTenantOnInvestigationCenter -- Failed to create tenant on ic:${nameObj.tenantID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        let message = `Status:${ex?.response?.status}`;
        if (ex?.response?.data?.message) {
            message = `Status:${ex?.response?.status}, Message:${JSON.stringify(ex?.response?.data?.message)}`;
        }
        return {
            isCreated: false,
            data: null,
            message: message
        };
    }
};

export const updateTenantPropertiesOnInvestigationCenter = async (cfrmApiGatewayURL, token, nameObj) => {
    try {
        let headers = null;
        let uri = `${cfrmApiGatewayURL}/InvestigationCenter/api/REST/tenantManagement/setTenantProperties/${nameObj.tenantID}`;
        if (token) {
            headers = { Authorization: `Bearer ${token}` };
            const icUrl = getIcUrl(cfrmApiGatewayURL);
            uri = `${icUrl}/InvestigationCenter/api/REST/tenantManagement/setTenantProperties/${nameObj.tenantID}`;
        }
        const res = await axios.put(uri, IC_TENANT_PROPERTIES, { headers: headers });
        if (res?.status === HttpCodes.OK) {
            console.log(`updateTenantPropertiesOnInvestigationCenter -- Succeeded to update tenant properties on ic:${nameObj.tenantID}`);
            return {
                isCreated: true,
                data: res.data
            };
        }
        throw JSON.stringify(res);
    } catch (ex) {
        if (ex?.response?.status === HttpCodes.CONFLICT) {
            console.log(`updateTenantPropertiesOnInvestigationCenter --tenant on IC:${nameObj.tenantID} is already exist`);
            return {
                isCreated: false,
                data: null
            };
        }
        const err = `updateTenantPropertiesOnInvestigationCenter -- Failed to update tenant properties on ic:${nameObj.tenantID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        let message = `Status:${ex?.response?.status}`;
        if (ex?.response?.data?.message) {
            message = `Status:${ex?.response?.status}, Message:${JSON.stringify(ex?.response?.data?.message)}`;
        }
        return {
            isCreated: false,
            data: null,
            message: message
        };
    }
};

export const parseTenantsParams = (name) => {
    const removeSpacesName = name.replace(/\s/g, '');
    const removeSpacielChars = removeSpacesName.replace(/[^a-zA-Z0-9]/g, '');
    return {
        tenantID: removeSpacielChars,
        tenantDisplayName: name
    };
};

const getIcUrl = (url) => {
    if (url.includes('cfrm-api')) {
        return url.replace('cfrm-api', 'devops-api');
    }
    return url.replace('api', 'devops-api');
};
