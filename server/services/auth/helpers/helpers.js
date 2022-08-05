import Role from '../models/role.model.js';
import { getUsernameGroupsMemmbership } from '../integrations/active-directory.js';

export const checkIfUserExistInRole = async (username) => {
    try {
        const roles = await Role.find({
            $or: [
                { 'admin.users': { $in: new RegExp(username, 'i') } },
                { 'advanced.users': { $in: new RegExp(username, 'i') } },
                { 'basic.users': { $in: new RegExp(username, 'i') } }
            ]
        });
        if (roles && roles.length > 0) {
            return true;
        }
        return false;
    } catch (ex) {
        const err = `checkIfUserExistInRole -- Error while trying to check if user:${username} exist in roles, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const checkIfUserExistInRoleGroups = async (userGroups, username) => {
    try {
        for (const userGroup of userGroups) {
            const roles = await Role.find({
                $or: [
                    { 'admin.groups': { $in: new RegExp(userGroup, 'i') } },
                    { 'advanced.groups': { $in: new RegExp(userGroup, 'i') } },
                    { 'basic.groups': { $in: new RegExp(userGroup, 'i') } }
                ]
            });
            if (roles && roles.length > 0) {
                return true;
            }
        }
        return false;
    } catch (ex) {
        const err = `checkIfUserExistInRoleGroups -- Error while trying to check if user:${username} exist in role groups, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const getAllRoles = async (cloudspaceID) => {
    try {
        const roles = await Role.findOne({ cloudspaceID: cloudspaceID });
        if (!roles) {
            throw `roles not found for cloudspace:${cloudspaceID}`;
        }
        return roles;
    } catch (ex) {
        const err = `getAllRoles -- Error while trying to get all roles, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const getRole = async (cloudspaceID, username) => {
    try {
        let finalRoleUserLevel = null;
        const role = await Role.find({
            cloudspaceID: cloudspaceID,
            $or: [
                { 'admin.users': { $in: new RegExp(username, 'i') } },
                { 'advanced.users': { $in: new RegExp(username, 'i') } },
                { 'basic.users': { $in: new RegExp(username, 'i') } }
            ]
        });
        if (role && role.length > 0) {
            const rolesLevels = ['admin', 'advanced', 'basic'];
            for (const roleLevel of rolesLevels) {
                const foundUser = role[0]._doc[roleLevel].users.find((user) => user.toLowerCase() === username.toLowerCase());

                if (foundUser === 'admin') {
                    return roleLevel;
                }
                if (foundUser) {
                    finalRoleUserLevel = roleLevel;
                }
            }
        }
        const userGroups = await getUsernameGroupsMemmbership(username);
        let finalRoleGroupLevel = null;
        for (const userGroup of userGroups) {
            const roles = await Role.find({
                cloudspaceID: cloudspaceID,
                $or: [
                    { 'admin.groups': { $in: new RegExp(userGroup, 'i') } },
                    { 'advanced.groups': { $in: new RegExp(userGroup, 'i') } },
                    { 'basic.groups': { $in: new RegExp(userGroup, 'i') } }
                ]
            });
            if (roles && roles.length > 0) {
                const rolesLevels = ['admin', 'advanced', 'basic'];
                for (const roleLevel of rolesLevels) {
                    const foundUser = roles[0]._doc[roleLevel].groups.find((group) => group.toLowerCase() === userGroup.toLowerCase());
                    if (!foundUser) {
                        continue;
                    }
                    if (roleLevel === 'admin') {
                        return roleLevel;
                    } else {
                        finalRoleGroupLevel = roleLevel;
                    }
                }
            }
        }
        if ([finalRoleUserLevel, finalRoleGroupLevel].includes('admin')) {
            return 'admin';
        }
        if ([finalRoleUserLevel, finalRoleGroupLevel].includes('advanced')) {
            return 'advanced';
        }
        if ([finalRoleUserLevel, finalRoleGroupLevel].includes('basic')) {
            return 'basic';
        }
        throw `Failed to find username:${username} in cloudspace:${cloudspaceID}`;
    } catch (ex) {
        const err = `getRole -- Error while trying to get all roles, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const updateRoleWithUsers = async (cloudspaceID, users, role, action) => {
    try {
        console.log(`updateRoleWithUsers -- Trying to ${action} users to role:${role} to cloudspace:${cloudspaceID}`);
        if (action === 'add') {
            let addQuery = { $addToSet: { 'admin.users': users } };
            if (role === 'advanced') {
                addQuery = { $addToSet: { 'advanced.users': users } };
            }
            if (role === 'basic') {
                addQuery = { $addToSet: { 'basic.users': users } };
            }
            const updatedDoc = await Role.findOneAndUpdate({ cloudspaceID: cloudspaceID }, addQuery);
            if (!updatedDoc) {
                throw `Failed to add users to role:${role}`;
            }
        } else {
            let removeQuery = { $pullAll: { 'admin.users': users } };
            if (role === 'advanced') {
                removeQuery = { $pullAll: { 'advanced.users': users } };
            }
            if (role === 'basic') {
                removeQuery = { $pullAll: { 'basic.users': users } };
            }
            const updatedDoc = await Role.findOneAndUpdate({ cloudspaceID: cloudspaceID }, removeQuery);
            if (!updatedDoc) {
                throw `Failed to remove users from role:${role}`;
            }
        }
    } catch (ex) {
        const err = `updateRoleWithUsers -- Error while trying update role users, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const updateRoleWithGroups = async (cloudspaceID, groups, role, action) => {
    try {
        console.log(`updateRoleWithGroups -- Trying to ${action} groups to role:${role}`);
        if (action === 'add') {
            let addQuery = { $addToSet: { 'admin.groups': groups } };
            if (role === 'advanced') {
                addQuery = { $addToSet: { 'advanced.groups': groups } };
            }
            if (role === 'basic') {
                addQuery = { $addToSet: { 'basic.groups': groups } };
            }
            const updatedDoc = await Role.findOneAndUpdate({ cloudspaceID: cloudspaceID }, addQuery);
            if (!updatedDoc) {
                throw `Failed to add groups to role:${role}`;
            }
        } else {
            let removeQuery = { $pullAll: { 'admin.groups': groups } };
            if (role === 'advanced') {
                removeQuery = { $pullAll: { 'advanced.groups': groups } };
            }
            if (role === 'basic') {
                removeQuery = { $pullAll: { 'basic.groups': groups } };
            }
            const updatedDoc = await Role.findOneAndUpdate({ cloudspaceID: cloudspaceID }, removeQuery);
            if (!updatedDoc) {
                throw `Failed to remove groups from role:${role}`;
            }
        }
    } catch (ex) {
        const err = `updateRoleWithGroups -- Error while trying update role groups, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};
