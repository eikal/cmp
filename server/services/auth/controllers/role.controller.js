import joi from 'joi';
import jwt from 'jsonwebtoken';
import { getAllRoles, getRole, updateRoleWithUsers, updateRoleWithGroups } from '../helpers/helpers.js';
import {
    getAllAvailableUsers,
    getAllAvailableGroups,
    getUsernameMetadata,
    getGroupsMetadata,
    getUsernameGroupsMemmbership,
    getUsersForGroup
} from '../integrations/active-directory.js';
import HttpCodes from '../../../shared/http-status-codes.js';

const getRoles = async (req, res, next) => {
    try {
        console.log(`getRoles -- User:${req.user} trying to get roles for cloudspace:${req.params.id}`);
        const schema = joi.object().keys({
            id: joi.string().required()
        });
        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`getRoles -- User:${req.user} Trying to get get roles for cloudspace:${req.query.id}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const roles = await getAllRoles(req.query.id);
        return res.status(HttpCodes.OK).send({ data: roles, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getRoles -- User:${req.user} Error while User:${req.user} trying to get roles ,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get roles' });
    }
};

const getUserRoleByCloudspace = async (req, res, next) => {
    try {
        console.log(`getRolesByCloudspace -- User:${req.user} trying to get user:${req.query.username} role for cloudspace:${req.query.cloudspaceID}`);
        const schema = joi.object().keys({
            cloudspaceID: joi.string().required(),
            username: joi.string().required()
        });
        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`getRolesByCloudspace -- User:${req.user} Trying to get get roles for cloudspace:${req.query.id}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        if (req.role === 'superAdmin') {
            res.clearCookie('x-access-token');
            const token = jwt.sign({ id: req.query.username, role: 'superAdmin' }, process.env.JWT_SECRET, { expiresIn: 86400 });
            return res.status(HttpCodes.OK).send({ data: { roles: 'superAdmin', token: token }, statusCode: HttpCodes.OK, message: null });
        }
        const roles = await getRole(req.query.cloudspaceID, req.query.username);
        res.clearCookie('x-access-token');
        const token = jwt.sign({ id: req.query.username, role: roles }, process.env.JWT_SECRET, { expiresIn: 86400 });
        return res.status(HttpCodes.OK).send({ data: { roles, token }, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getRolesByCloudspace -- User:${req.user} Error while User:${req.user} trying to get roles ,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get roles' });
    }
};

const updateRoleEntities = async (req, res, next) => {
    try {
        console.log(`updateRole -- User:${req.user} Trying to update role:${req.body.role}`);
        const schema = joi.object().keys({
            cloudspaceID: joi.string().required(),
            users: joi.array().required(),
            groups: joi.array().required(),
            role: joi.string().required(),
            action: joi.string().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`updateRole -- User:${req.user} Trying to update role:${req.body.role}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        if (req.body.users.length === 0 && req.body.groups.length === 0) {
            console.error(`updateRole -- User:${req.user} Entities cannot be empty`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: 'Entities cannot be empty' });
        }
        if (req.body.users.length > 0) {
            await updateRoleWithUsers(req.body.cloudspaceID, req.body.users, req.body.role, req.body.action);
        } else {
            await updateRoleWithGroups(req.body.cloudspaceID, req.body.groups, req.body.role, req.body.action);
        }
        return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`updateRole -- User:${req.user} Error while User:${req.user} trying to update role ,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get roles' });
    }
};

const availableUsers = async (req, res, next) => {
    try {
        console.log(`availableUsers -- User:${req.user} Trying to find available Users for username:${req.query.username}`);
        const schema = joi.object().keys({
            username: joi.string().required()
        });
        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`availableUsers -- User:${req.user} Trying to find available Users for username:${req.query.username}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const users = await getAllAvailableUsers(req.query.username);
        return res.status(HttpCodes.OK).send({ data: users, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`availableUsers -- User:${req.user} Trying to find available Users for username:${req.query.username} ,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get users' });
    }
};

const availableGroups = async (req, res, next) => {
    try {
        console.log(`availableGroups -- User:${req.user} Trying to find available Groups for group:${req.query.group}`);
        const schema = joi.object().keys({
            group: joi.string().required()
        });
        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`availableGroups -- User:${req.user} Trying to find available Groups for group:${req.query.group}, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const groups = await getAllAvailableGroups(req.query.group);
        return res.status(HttpCodes.OK).send({ data: groups, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`availableGroups -- User:${req.user} Trying to find available Groups for group:${req.query.group} ,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get Groups' });
    }
};

const getUserMetadata = async (req, res, next) => {
    try {
        console.log(`getUserMetadata -- User:${req.user} Trying to get user:${req.query.username} metadata`);
        const schema = joi.object().keys({
            username: joi.string().required()
        });
        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`getUserMetadata -- User:${req.user} Trying to get user:${req.query.username} metadata, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const userMetadata = await getUsernameMetadata(req.query.username);
        const userGroups = await getUsernameGroupsMemmbership(req.query.username);
        userMetadata.Groups = userGroups;
        return res.status(HttpCodes.OK).send({ data: userMetadata, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getUserMetadata -- User:${req.user} Trying to get user:${req.query.username} metadata ,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get user metadata' });
    }
};

const getGroupMetadata = async (req, res, next) => {
    try {
        console.log(`getGroupMetadata -- User:${req.user} Trying to get group:${req.query.group} metadata`);
        const schema = joi.object().keys({
            group: joi.string().required()
        });
        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`getGroupMetadata -- User:${req.user} Trying to get group:${req.query.group} metadata, Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const groupMetadata = await getGroupsMetadata(req.query.group);
        const users = await getUsersForGroup(req.query.group);
        groupMetadata.Users = users;
        return res.status(HttpCodes.OK).send({ data: groupMetadata, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getGroupMetadata -- User:${req.user} Trying to get group:${req.query.group} metadata ,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get user metadata' });
    }
};

export default {
    getRoles,
    getUserRoleByCloudspace,
    updateRoleEntities,
    availableUsers,
    availableGroups,
    getUserMetadata,
    getGroupMetadata
};
