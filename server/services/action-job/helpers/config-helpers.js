
import ActionJobConfig from '../models/action-job-config.model.js';
import {
    CFRM_ACTION_JOBS_TEMPLATE,
    ELK_ACTION_JOBS_TEMPLATE,
    APACHEDS_ACTION_JOBS_TEMPLATE,
    ARTEMIS_ACTION_JOBS_TEMPLATE,
    QUERY_EXPORTER_ACTION_JOBS_TEMPLATE
} from '../config/template/index.js';
import Cloudspace from '../../entities-api/models/cloudspace/cloudspace.model.js';
import Project from '../../entities-api/models/project/project.model.js';
import mongoose from 'mongoose';
const { startSession } = mongoose;

export const getActionJobsByCloudspaceID = async (cloudspaceID) => {
    try {
        const cloudspace = await Cloudspace.findById(cloudspaceID);
        if (!cloudspace) {
            throw `Cloudspace:${cloudspaceID} not found`;
        }
        const projectIDs = cloudspace._doc.projectIDs;
        const projects = await Project.find({ _id: { $in: projectIDs } });
        for (const project of projects) {
            const actionJobDocs = await ActionJobConfig.find({ projectID: project._doc._id });
            project._doc.customActions = actionJobDocs;
        }
        return projects;
    } catch (ex) {
        const err = `getActionJobsByCloudspaceID -- Failed to get action jobs by cloudspaceID:${cloudspaceID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const getActionJobsByProjectID = async (projectID) => {
    try {
        const actionJobDocs = await ActionJobConfig.find({ projectID: projectID });
        return actionJobDocs;
    } catch (ex) {
        const err = `getActionJobsByProjectID -- Failed to get action jobs by ProjectID:${projectID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const createLabelActionConfig = async (projectID, createdBy, labelName, btRole, description) => {
    const session = await startSession();
    try {
        session.startTransaction();
        const isLabelExistAlready = await ActionJobConfig.findOne({ name: labelName.toLowerCase(), projectID: projectID });
        if (isLabelExistAlready) {
            throw `label: ${labelName} already exists in projectID:${projectID}`;
        }
        const actionJobConfigObj = {
            projectID: projectID,
            name: labelName.toLowerCase(),
            displayName: labelName,
            bt_role: btRole,
            description: description,
            createdDate: new Date(),
            updatedDate: new Date(),
            createdBy: createdBy,
            actions: []
        };
        const actionJobConifg = new ActionJobConfig(actionJobConfigObj);
        const isActionJobConifgCreated = await actionJobConifg.save({ session });
        if (!isActionJobConifgCreated?._doc) {
            throw `Failed to create label action job config:${labelName}`;
        }
        console.log(`createLabelActionConfig -- Successfully to create label action job config:${labelName}`);
        await session.commitTransaction();
        session.endSession();
        return isActionJobConifgCreated._doc;
    } catch (ex) {
        await session.abortTransaction();
        session.endSession();
        const err = `createLabelActionConfig -- Failed to create: ${labelName} in ProjectID:${projectID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const updateLabelActionConfig = async (labelID, labelName, btRole, description, isActive) => {
    const session = await startSession();
    try {
        session.startTransaction();
        const query = {
            name: labelName.toLowerCase(),
            displayName: labelName,
            bt_role: btRole,
            description: description,
            updatedDate: new Date(),
            isActive: isActive
        };
        const isActionJobConfigUpdated = await ActionJobConfig.updateOne({ _id: labelID }, query, { session });
        if (!isActionJobConfigUpdated?.ok || !isActionJobConfigUpdated?.n) {
            throw 'Failed to update action job config';
        };
        console.log(`updateLabelActionConfig -- Successfully to update label action job config:${labelName}`);
        await session.commitTransaction();
        session.endSession();
    } catch (ex) {
        await session.abortTransaction();
        session.endSession();
        const err = `updateLabelActionConfig -- Failed to update: ${labelName} , Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const deleteLabelActionConfig = async (labelID) => {
    const session = await startSession();
    try {
        session.startTransaction();
        const isActionJobConfigDeleted = await ActionJobConfig.findByIdAndDelete(labelID, { session });
        if (!isActionJobConfigDeleted) {
            throw 'Failed to delete action job config';
        };
        console.log(`deleteLabelActionConfig -- Successfully to delete label action job config:${labelID}`);
        await session.commitTransaction();
        session.endSession();
    } catch (ex) {
        await session.abortTransaction();
        session.endSession();
        const err = `deleteLabelActionConfig -- Failed to delete: ${labelID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const createActionToLabelActionConfig = async (labelID, name, type, value, description, isActive, roles, createdBy) => {
    const session = await startSession();
    try {
        session.startTransaction();
        const isActionJobAlreadyExist = await ActionJobConfig.findOne({ _id: labelID, 'actions.name': name.toLowerCase() });
        if (isActionJobAlreadyExist) {
            throw `Action job:${name} already exists`;
        }
        const query = {
            updatedDate: new Date(),
            $push: {
                actions: {
                    name: name.toLowerCase(),
                    displayName: name,
                    type: type,
                    value: value,
                    isActive: isActive,
                    description: description,
                    roles: roles,
                    createdBy: createdBy,
                    updatedDate: new Date()
                }
            }
        };
        const isActionJobConfigUpdated = await ActionJobConfig.findOneAndUpdate({ _id: labelID }, query, { session, returnDocument: 'after', returnOriginal: false });
        const isActionInserted = isActionJobConfigUpdated?.actions.find((action) => action.name.toLowerCase() === name.toLowerCase());
        if (!isActionJobConfigUpdated || isActionJobConfigUpdated?.errors || !isActionInserted) {
            throw 'Failed to update action job config';
        };
        console.log(`createActionToLabelActionConfig -- Successfully to create action:${name} label action job config:${labelID}`);
        await session.commitTransaction();
        session.endSession();
        return isActionInserted;
    } catch (ex) {
        await session.abortTransaction();
        session.endSession();
        const err = `createActionToLabelActionConfig -- Failed to create action:${name} label action job config:${labelID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const updateActionToLabelActionConfig = async (labelID, actionID, name, type, value, description, isActive, roles) => {
    const session = await startSession();
    try {
        session.startTransaction();
        const query = {
            updatedDate: new Date(),
            $set: {
                'actions.$.name': name.toLowerCase(),
                'actions.$.displayName': name,
                'actions.$.type': type,
                'actions.$.value': value,
                'actions.$.isActive': isActive,
                'actions.$.roles': roles,
                'actions.$.description': description,
                'actions.$.updatedDate': new Date()
            }
        };
        const isActionJobConfigUpdated = await ActionJobConfig.updateOne({ _id: labelID, 'actions._id': actionID }, query, { session });
        if (!isActionJobConfigUpdated?.ok || !isActionJobConfigUpdated?.n) {
            throw 'Failed to update action job config';
        };
        console.log(`createActionToLabelActionConfig -- Successfully to create action:${name} label action job config:${labelID}`);
        await session.commitTransaction();
        session.endSession();
    } catch (ex) {
        await session.abortTransaction();
        session.endSession();
        const err = `createActionToLabelActionConfig -- Failed to create action:${name} label action job config:${labelID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const deleteActionToLabelActionConfig = async (labelID, actionID) => {
    const session = await startSession();
    try {
        session.startTransaction();
        const isActionJobConfigUpdated = await ActionJobConfig.updateOne({ _id: labelID }, { $pull: { actions: { _id: actionID } } }, { session });
        if (!isActionJobConfigUpdated?.ok || !isActionJobConfigUpdated?.n) {
            throw 'Failed to update action job config';
        };
        console.log(`deleteActionToLabelActionConfig -- Successfully to delete action:${actionID} from label action job config:${labelID}`);
        await session.commitTransaction();
        session.endSession();
    } catch (ex) {
        await session.abortTransaction();
        session.endSession();
        const err = `deleteActionToLabelActionConfig -- Failed to delete action:${actionID} from label action job config:${labelID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

export const createDefaultActionsByProjectID = async (projectID, createdBy) => {
    const session = await startSession();
    try {
        session.startTransaction();
        const pormises = [
            createDefaultActionJobByTemplate(projectID, CFRM_ACTION_JOBS_TEMPLATE, createdBy, session),
            createDefaultActionJobByTemplate(projectID, ELK_ACTION_JOBS_TEMPLATE, createdBy, session),
            createDefaultActionJobByTemplate(projectID, APACHEDS_ACTION_JOBS_TEMPLATE, createdBy, session),
            createDefaultActionJobByTemplate(projectID, ARTEMIS_ACTION_JOBS_TEMPLATE, createdBy, session),
            createDefaultActionJobByTemplate(projectID, QUERY_EXPORTER_ACTION_JOBS_TEMPLATE, createdBy, session)
        ];
        const promisesResponse = await Promise.all(pormises);
        console.log(`createDefaultActionsByProjectID -- Successfully to create default actions for porojectID:${projectID}`);
        await session.commitTransaction();
        session.endSession();
        return promisesResponse;
    } catch (ex) {
        await session.abortTransaction();
        session.endSession();
        const err = `createDefaultActionsByProjectID -- Failed to create default actions for porojectID:${projectID}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

const createDefaultActionJobByTemplate = async (projectID, tempalteObject, createdBy, session) => {
    try {
        const isActionJobConfigExist = await ActionJobConfig.findOne({ projectID: projectID, name: tempalteObject.name });
        if (isActionJobConfigExist) {
            return isActionJobConfigExist;
        }
        tempalteObject.projectID = projectID;
        tempalteObject.createdDate = new Date();
        tempalteObject.updatedDate = new Date();
        tempalteObject.createdBy = createdBy;
        for (const action of tempalteObject.actions) {
            action.createdBy = createdBy;
            action.updatedDate = new Date();
        }
        const actionJobConifg = new ActionJobConfig(tempalteObject);
        const isActionJobConifgCreated = await actionJobConifg.save({ session });
        if (!isActionJobConifgCreated?._doc) {
            throw `Failed to create label action job config:${tempalteObject.displayName}`;
        }
        console.log(`createDefaultActionJobByTemplate -- Successfully to create label action job config:${tempalteObject.displayName}`);
        return isActionJobConifgCreated._doc;
    } catch (ex) {
        const err = `createDefaultActionJobByTemplate -- Failed to create default action:${tempalteObject.displayName}, Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};
