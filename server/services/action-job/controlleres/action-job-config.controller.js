import joi from 'joi';
import HttpCodes from '../../../shared/http-status-codes.js';
import { ACTION_JOB_CONFIG_TYPES } from '../config/config.js';
import {
    getActionJobsByCloudspaceID,
    getActionJobsByProjectID,
    createLabelActionConfig,
    updateLabelActionConfig,
    deleteLabelActionConfig,
    createActionToLabelActionConfig,
    updateActionToLabelActionConfig,
    deleteActionToLabelActionConfig,
    createDefaultActionsByProjectID
} from '../helpers/config-helpers.js';

const getActionJobsByCloudspace = async (req, res, next) => {
    try {
        console.log(`getActionJobsByCloudspace -- User:${req.user} Trying to get action jobs by cloudspaceID:${req.params.id}`);
        const schema = joi.object().keys({
            id: joi.string().required()
        });

        const result = schema.validate(req.params);
        if (result.error) {
            console.error(`getActionJobsByCloudspace -- User:${req.user} Error while Trying to get action jobs by cloudspaceID:${req.params.id},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const actionJobs = await getActionJobsByCloudspaceID(req.params.id);
        console.log(`getActionJobsByCloudspace -- User:${req.user} Found :${actionJobs.length} action jobs categories`);
        return res.status(HttpCodes.OK).send({ data: actionJobs, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getActionJobsByCloudspace -- User:${req.user} Error while Trying to get action jobs by cloudspaceID:${req.params.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'get project failed' });
    }
};

const getActionJobsByProject = async (req, res, next) => {
    try {
        console.log(`getActionJobsByProject -- User:${req.user} Trying to get action jobs by projectID:${req.params.id}`);
        const schema = joi.object().keys({
            id: joi.string().required()
        });

        const result = schema.validate(req.params);
        if (result.error) {
            console.error(`getActionJobsByProject -- User:${req.user} Error while Trying to get action jobs by projectID:${req.params.id},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const actionJobs = await getActionJobsByProjectID(req.params.id);
        console.log(`getActionJobsByProject -- User:${req.user} Found :${actionJobs.length} action jobs categories`);
        return res.status(HttpCodes.OK).send({ data: actionJobs, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getActionJobsByProject -- User:${req.user} Error while Trying to get action jobs by projectID:${req.params.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'get project failed' });
    }
};

const createLabelConfig = async (req, res, next) => {
    try {
        console.log(`createLabelConfig -- User:${req.user} Trying to create action job label config:${req.body.name}`);
        const schema = joi.object().keys({
            projectID: joi.string().required(),
            name: joi.string().required().max(30),
            bt_role: joi.array().required().min(1),
            description: joi.string().required().allow(null)
        });

        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`createLabelConfig -- User:${req.user} Error while Trying to create action job label config:${req.body.name},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const labelActionConfig = await createLabelActionConfig(req.body.projectID, req.user, req.body.name, req.body.bt_role, req.body.description);
        console.log(`createLabelConfig -- User:${req.user} Succeeded to create new label config:${req.body.name}`);
        return res.status(HttpCodes.OK).send({ data: labelActionConfig, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        let exMessage = 'label config creation failed';
        console.error(`createLabelConfig -- User:${req.user} Error while trying to create action job label config:${req.body.name},Error:${JSON.stringify(ex)}`);
        if (ex.includes('already exists')) {
            exMessage = 'Category already exists';
        }
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: exMessage });
    }
};

const updateLabelConfig = async (req, res, next) => {
    try {
        console.log(`updateLabelConfig -- User:${req.user} Trying to update action job label config:${req.body.name}`);
        const schema = joi.object().keys({
            labelID: joi.string().required(),
            name: joi.string().required().max(30),
            bt_role: joi.array().required().min(1),
            description: joi.string().required().allow(null),
            isActive: joi.boolean().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`updateLabelConfig -- User:${req.user} Error while Trying to update action job label config:${req.body.name},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        await updateLabelActionConfig(req.body.labelID, req.body.name, req.body.bt_role, req.body.description, req.body.isActive);
        console.log(`updateLabelConfig -- User:${req.user} Succeeded to update label config:${req.body.name}`);
        return res.status(HttpCodes.OK).send({ data: req.body, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`updateLabelConfig -- User:${req.user} User:${req.user} Error while trying to update action job label config:${req.body.name},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'label config update failed' });
    }
};

const deleteLabelConfig = async (req, res, next) => {
    try {
        console.log(`deleteLabelConfig -- User:${req.user} Trying to delete action job label config:${req.params.id}`);
        const schema = joi.object().keys({
            id: joi.string().required()
        });

        const result = schema.validate(req.params);
        if (result.error) {
            console.error(`deleteLabelConfig -- User:${req.user} Error while Trying to delete action job label config:${req.body.id},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        await deleteLabelActionConfig(req.params.id);
        console.log(`deleteLabelConfig -- User:${req.user} Succeeded to delete action job label config:${req.body.id}`);
        return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`deleteLabelConfig -- User:${req.user} Error while trying to delete action job label config:${req.body.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'label config deletion failed' });
    }
};

const createActionToLabelConfig = async (req, res, next) => {
    try {
        console.log(`createActionToLabelConfig -- User:${req.user} Trying to create action job:${req.body.name} to label config:${req.body.labelID}`);
        const schema = joi.object().keys({
            labelID: joi.string().required(),
            name: joi.string().required().max(30),
            type: joi.string().required().valid(ACTION_JOB_CONFIG_TYPES.SSH_COMMAND, ACTION_JOB_CONFIG_TYPES.FILE_VIEW),
            value: joi.array().required().min(1),
            isActive: joi.boolean().required(),
            description: joi.string().required().allow(null),
            roles: joi.array().required().min(1)
        });

        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`createActionToLabelConfig -- User:${req.user} Error while Trying to create action job:${req.body.name} to label config:${req.body.labelID},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const actionJobObj = await createActionToLabelActionConfig(
            req.body.labelID,
            req.body.name,
            req.body.type,
            req.body.value,
            req.body.description,
            req.body.isActive,
            req.body.roles,
            req.user
        );
        console.log(`createActionToLabelConfig -- User:${req.user} Succeeded to create new action:${req.body.name} to label config:${req.body.labelID}`);
        return res.status(HttpCodes.OK).send({ data: actionJobObj, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        let exMessage = 'Action config creation failed';
        console.error(`createActionToLabelConfig -- User:${req.user} Error while trying to create new action:${req.body.name} to label config:${req.body.labelID},Error:${JSON.stringify(ex)}`);
        if (ex.includes('already exists')) {
            exMessage = 'Action job already exists';
        }
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: exMessage });
    }
};

const updateActionToLabelConfig = async (req, res, next) => {
    try {
        console.log(`updateActionToLabelConfig -- User:${req.user} Trying to update action job:${req.body.name} to label config:${req.body.labelID}`);
        const schema = joi.object().keys({
            labelID: joi.string().required(),
            actionID: joi.string().required(),
            name: joi.string().required().max(30),
            type: joi.string().required().valid(ACTION_JOB_CONFIG_TYPES.SSH_COMMAND, ACTION_JOB_CONFIG_TYPES.FILE_VIEW),
            value: joi.array().required().min(1),
            description: joi.string().required().allow(null),
            isActive: joi.boolean().required(),
            roles: joi.array().required().min(1)
        });

        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`updateActionToLabelConfig -- User:${req.user} Error while Trying to update action job:${req.body.name} to label config:${req.body.labelID},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        await updateActionToLabelActionConfig(
            req.body.labelID,
            req.body.actionID,
            req.body.name,
            req.body.type,
            req.body.value,
            req.body.description,
            req.body.isActive,
            req.body.roles
        );
        console.log(`updateActionToLabelConfig -- User:${req.user} Succeeded to update new action:${req.body.name} to label config:${req.body.labelID}`);
        return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`updateActionToLabelConfig -- User:${req.user} Error while Trying to update action job:${req.body.name} to label config:${req.body.labelID},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'action update failed' });
    }
};

const deleteActionToLabelConfig = async (req, res, next) => {
    try {
        console.log(`deleteActionToLabelConfig -- User:${req.user} Trying to delete action ID:${req.body.actionID} from label config:${req.body.labelID}`);
        const schema = joi.object().keys({
            labelID: joi.string().required(),
            actionID: joi.string().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`deleteActionToLabelConfig -- User:${req.user} Error while Trying to delete action ID:${req.body.actionID} from label config:${req.body.labelID},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        await deleteActionToLabelActionConfig(req.body.labelID, req.body.actionID);
        console.log(`deleteActionToLabelConfig -- User:${req.user} Succeeded to delete action:${req.body.actionID}`);
        return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`deleteActionToLabelConfig -- User:${req.user} Error while Trying to delete action ID:${req.body.actionID} from label config:${req.body.labelID},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'action deletion failed' });
    }
};

const createDefaultActions = async (req, res, next) => {
    try {
        console.log(`createDefaultActions -- User:${req.user} Trying to create default actions for projectID:${req.body.projectID}`);
        const schema = joi.object().keys({
            projectID: joi.string().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`createDefaultActions -- User:${req.user} Error while Trying to create default actions for projectID:${req.body.projectID},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const actionJobs = await createDefaultActionsByProjectID(req.body.projectID, req.user);
        console.log(`createDefaultActions -- User:${req.user} Succeeded to create default actions for projectID:${req.body.projectID}`);
        return res.status(HttpCodes.OK).send({ data: actionJobs, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`createDefaultActions -- User:${req.user} Error while Trying to create default actions for projectID:${req.body.projectID},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to create default actions' });
    }
};

export default {
    getActionJobsByCloudspace,
    getActionJobsByProject,
    createLabelConfig,
    updateLabelConfig,
    deleteLabelConfig,
    createActionToLabelConfig,
    updateActionToLabelConfig,
    deleteActionToLabelConfig,
    createDefaultActions
};
