/* eslint-disable prefer-promise-reject-errors */

import ActiveDirectory from 'activedirectory';
import { GB_ADMIN_GROUPS } from '../config/config.js';

const getAdClient = () => {
    try {
        const config = {
            url: process.env.LDAP_URL,
            baseDN: process.env.BASE_DN,
            username: `${process.env.LDAP_DOMAIN}\\${process.env.LDAP_USER}`,
            password: process.env.LDAP_PASSWORD
        };
        const adClient = new ActiveDirectory(config);
        return adClient;
    } catch (ex) {
        console.error(`getAdClient -- Failed connect AD Client,Error:${JSON.stringify(ex)}`);
        throw ex;
    }
};

/**
 * This method execute ldap query against AD to check if this user exist and
 * @param {String} username
 * @param {String} usernameForGroup
 * @param {String} password
 * @returns True if the user sucssesfuly to authenticate otherwise false
 */
export const handleAuthUser = async (username, usernameForGroup, password) => {
    try {
        const adClient = getAdClient();
        await checkUserAuthentication(adClient, username, password); // Check user authentication
        const response = await checkIfUserIsSuperAdmin(adClient, usernameForGroup); // check if user is an admin user otherwise return his groups
        const usernameMetadata = await getUsernameMetadata(usernameForGroup);
        response.username = usernameMetadata.sAMAccountName;
        return response;
    } catch (ex) {
        console.error(`authUser -- Failed to authenticate user,Error:${JSON.stringify(ex)}`);
        throw ex;
    }
};

const checkUserAuthentication = async (adClient, username, password) => {
    return new Promise((resolve, reject) => {
        try {
            adClient.authenticate(username, password, function (err, auth) {
                if (err) {
                    console.error(`checkUserAuthentication -- Failed to authenticate user,Error:${JSON.stringify(err)}`);
                    if (err?.code?.toString().includes('ETIMEDOUT') || err?.code?.toString().includes('ECONNREFUSED')) {
                        return reject({ isAuth: false, message: 'ETIMEDOUT' });
                    }
                    return reject({ isAuth: false, message: 'Username/Password incorrect' });
                };
                return resolve();
            });
        } catch (ex) {
            console.error(`checkUserAuthentication -- Failed to authenticate user,Error:${JSON.stringify(ex)}`);
            return reject(ex);
        }
    });
};

const checkIfUserIsSuperAdmin = async (adClient, usernameForGroup) => {
    return new Promise((resolve, reject) => {
        try {
            const AdministorError = 'Please contact administrator for more information';
            adClient.getGroupMembershipForUser(usernameForGroup, function (err, groups) {
                if (err) {
                    console.error('checkIfUserIsSuperAdmin: ' + JSON.stringify(err));
                    return reject({ isAuth: false, message: AdministorError });
                }
                if (!groups) {
                    console.error(`checkIfUserIsSuperAdmin -- user:${usernameForGroup} has no groups`);
                    return reject({ isAuth: false, message: AdministorError });
                }
                for (const group of groups) {
                    if (GB_ADMIN_GROUPS.includes(group.cn)) {
                        console.log(`checkIfUserIsSuperAdmin -- username:${usernameForGroup} authenticate sucussefuly`);
                        return resolve({ isAuth: true, message: null, role: 'superAdmin', groups: null });
                    }
                }
                console.log(`checkIfUserIsSuperAdmin -- username:${usernameForGroup} is noy related to admin groups`);
                return resolve({ isAuth: true, message: null, role: null, groups: groups.map((group) => group.cn) });
            });
        } catch (ex) {
            console.error(`checkIfUserIsSuperAdmin -- Failed to authenticate user,Error:${JSON.stringify(ex)}`);
            return reject(ex);
        }
    });
};

export const getAllAvailableUsers = async (username) => {
    return new Promise((resolve, reject) => {
        try {
            const adClient = getAdClient();
            adClient.findUsers(`|(sAMAccountName=*${username}*)(cn=*${username}*)`, function (err, results) {
                if (err) {
                    console.error(`getAllAvailableUsers -- Failed to get available users,Error:${JSON.stringify(err)}`);
                    return reject(err);
                };
                if (!results || (results && Array.isArray(results) && results.length === 0)) {
                    return resolve([]);
                }
                return resolve(results.map((user) => user.sAMAccountName));
            });
        } catch (ex) {
            console.error(`getAllAvailableUsers -- Failed to get available users,Error:${JSON.stringify(ex)}`);
            return reject(ex);
        }
    });
};

export const getAllAvailableGroups = async (group) => {
    return new Promise((resolve, reject) => {
        try {
            const adClient = getAdClient();
            adClient.findGroups(`cn=*${group}*`, function (err, results) {
                if (err) {
                    console.error(`getAllAvailableGroups -- Failed to get available groups,Error:${JSON.stringify(err)}`);
                    return reject(err);
                };
                if (!results || (results && Array.isArray(results) && results.length === 0)) {
                    return resolve([]);
                }
                return resolve(results.map((group) => group.cn));
            });
        } catch (ex) {
            console.error(`getAllAvailableGroups -- Failed to get available groups,Error:${JSON.stringify(ex)}`);
            return reject(ex);
        }
    });
};

export const getUsernameMetadata = async (username) => {
    return new Promise((resolve, reject) => {
        try {
            const adClient = getAdClient();
            adClient.findUser(username, function (err, result) {
                if (err) {
                    console.error(`getUsernameMetadata -- Failed to get username:${username} metadata,Error:${JSON.stringify(err)}`);
                    return reject(err);
                };
                if (!result) {
                    console.error(`getUsernameMetadata -- Failed to get username:${username} metadata,User not found`);
                    return reject(err);
                }
                if (result.whenCreated) delete result.whenCreated;
                if (result.pwdLastSet) delete result.pwdLastSet;
                if (result.userAccountControl) delete result.userAccountControl;
                return resolve(result);
            });
        } catch (ex) {
            console.error(`getAllAvailableUsers -- Failed to get username:${username} metadata,Error:${JSON.stringify(ex)}`);
            return reject(ex);
        }
    });
};

export const getUsernameGroupsMemmbership = async (username) => {
    return new Promise((resolve, reject) => {
        try {
            const adClient = getAdClient();
            adClient.getGroupMembershipForUser(username, function (err, groups) {
                if (err) {
                    console.error('getUsernameGroupsMemmbership: ' + JSON.stringify(err));
                    return reject(err);
                }
                if (!groups) {
                    console.log(`getUsernameGroupsMemmbership -- user:${username} has no groups`);
                    return resolve([]);
                }
                return resolve(groups.map((group) => group.cn));
            });
        } catch (ex) {
            console.error(`getUsernameGroupsMemmbership -- Failed to get username:${username} groups,Error:${JSON.stringify(ex)}`);
            return reject(ex);
        }
    });
};

export const getGroupsMetadata = async (group) => {
    return new Promise((resolve, reject) => {
        try {
            const adClient = getAdClient();
            adClient.findGroup(group, function (err, result) {
                if (err) {
                    console.error(`getGroupsMetadata -- Failed to get group:${group} metadata,Error:${JSON.stringify(err)}`);
                    return reject(err);
                };
                if (!result) {
                    console.error(`getGroupsMetadata -- Failed to get group:${group} metadata,Group not found`);
                    return reject(err);
                }
                return resolve(result);
            });
        } catch (ex) {
            console.error(`getGroupsMetadata -- Failed to get group:${group} metadata,Error:${JSON.stringify(ex)}`);
            return reject(ex);
        }
    });
};

export const getUsersForGroup = async (group) => {
    return new Promise((resolve, reject) => {
        try {
            const adClient = getAdClient();
            adClient.getUsersForGroup(group, function (err, result) {
                if (err) {
                    console.error(`getUsersForGroup -- Failed to get group:${group} users,Error:${JSON.stringify(err)}`);
                    return reject(err);
                };
                if (!result) {
                    console.error(`getGroupsMetadata -- Failed to get group:${group} users,Users not found`);
                    return reject(err);
                }
                return resolve(result.map((res) => res.sAMAccountName));
            });
        } catch (ex) {
            console.error(`getGroupsMetadata -- Failed to get group:${group} users,Error:${JSON.stringify(ex)}`);
            return reject(ex);
        }
    });
};
