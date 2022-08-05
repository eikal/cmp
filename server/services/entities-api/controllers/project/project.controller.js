
import joi from 'joi';
import Cloudspace from '../../models/cloudspace/cloudspace.model.js';
import Project from '../../models/project/project.model.js';
import HttpCodes from '../../../../shared/http-status-codes.js';
import { getProjectReleations, deleteProjectRelation } from '../../helpers/queries.js';
import mongoose from 'mongoose';
const { startSession } = mongoose;

const createProject = async (req, res, next) => {
    const session = await startSession();
    try {
        console.log(`createProject -- User:${req.user} Trying to create new Project:${req.body.name}`);
        const schema = joi.object().keys({
            name: joi.string().required().min(2).max(30),
            description: joi.string().required(),
            solution: joi.string().required(),
            cloudspaceID: joi.string().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`createProject -- User:${req.user} Error while trying to create new Project:${req.body.name},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        session.startTransaction();
        req.body.createdBy = req.user;
        req.body.createdDate = new Date();
        req.body.updatedDate = new Date();
        const project = new Project(req.body);
        const isProjectDocCreated = await project.save({ session });
        if (!isProjectDocCreated?._doc) {
            throw `createProject -- User:${req.user} Failed to create project:${req.body.name} for cloudspace:${req.body.cloudspaceID} by user :${req.user}`;
        }
        const isCloudspaceUpdated = await Cloudspace.findByIdAndUpdate(req.body.cloudspaceID, { $addToSet: { projectIDs: isProjectDocCreated._doc._id.toString() } });
        if (!isCloudspaceUpdated) {
            throw `createProject -- User:${req.user} Faild to relate  project:${req.body.name} for cloudspace:${req.body.cloudspaceID} by user :${req.user}`;
        }
        await session.commitTransaction();
        session.endSession();
        console.log(`createProject -- User:${req.user} Succeeded to create new Project:${req.body.name}`);
        return res.status(HttpCodes.OK).send({ data: isProjectDocCreated._doc, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        await session.abortTransaction();
        session.endSession();
        console.error(`createProject -- User:${req.user} Error while trying to create new Project:${req.body.name},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Project creation failed' });
    }
};

const getProjectByID = async (req, res, next) => {
    try {
        console.log(`getProjectByID -- User:${req.user} Trying to get Project:${req.params.id}`);
        const project = await getProjectReleations(req.params.id);
        console.log(`getProjectByID -- User:${req.user} Succeeded to get Project:${req.params.id}`);
        return res.status(HttpCodes.OK).send({ data: project, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getProjectByID -- User:${req.user} Error while trying to get Project:${req.params.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Failed to get project ${req.params.id}` });
    }
};

const getProjects = async (req, res, next) => {
    try {
        console.log(`getProjects -- User:${req.user} Trying to get Projects for cloudspace:${req.query.cloudspace}`);
        const schema = joi.object().keys({
            cloudspace: joi.string().required()
        });
        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`getProjects -- User:${req.user} Trying to get Projects for cloudspace,Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const isCloudspaceIsFound = await Cloudspace.findById(req.query.cloudspace);
        if (!isCloudspaceIsFound) {
            throw `Faild to find cloudspace:${req.query.cloudspace}`;
        }
        const isProjectsFound = await Project.find({ _id: { $in: isCloudspaceIsFound._doc.projectIDs } });
        const promises = [];
        if (isProjectsFound) {
            for (const project of isProjectsFound) {
                promises.push(getProjectReleations(project._id.toString()));
            }
            const response = await Promise.all(promises);
            console.log(`getProject -- User:${req.user} Succeeded to get Projects`);
            return res.status(HttpCodes.OK).send({ data: response, statusCode: HttpCodes.OK, message: null });
        }
        console.error(`getProjects -- User:${req.user} Error while trying to get Projects`);
        return res.status(HttpCodes.NOT_FOUND).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Project:${req.body.id} not found` });
    } catch (ex) {
        console.error(`getProjects -- User:${req.user} Error while trying to get Projects,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Failed to get project ${req.body.id}` });
    }
};

const updateProjectByID = async (req, res, next) => {
    try {
        console.log(`updateProjectByID -- User:${req.user} Trying to update Project:${req.params.id}, Project params: ${req.body.name},${req.body.description}`);
        const schema = joi.object().keys({
            name: joi.string().required().min(2).max(30),
            description: joi.string().required(),
            solution: joi.string().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`updateProjectByID -- User:${req.user} Error while trying to update Project:${req.params.id},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        req.body.updatedDate = new Date();
        req.body.createdBy = req.user;
        const isProjectUpdated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (isProjectUpdated) {
            console.log(`updateProjectByID -- User:${req.user} Succeeded to update Project:${req.params.id}`);
            return res.status(HttpCodes.OK).send({ data: isProjectUpdated, statusCode: HttpCodes.OK, message: null });
        }
        console.error(`updateProjectByID -- User:${req.user} Error while trying to update Project:${req.params.id}`);
        return res.status(HttpCodes.NOT_FOUND).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Project:${req.params.id} not found` });
    } catch (ex) {
        console.error(`updateProjectByID -- User:${req.user} Error while trying to update Project:${req.params.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Failed to update project ${req.params.id}` });
    }
};

const deleteProjectByID = async (req, res, next) => {
    const session = await startSession();
    try {
        session.startTransaction();
        console.log(`deleteProjectByID -- User:${req.user} Trying to delete Project:${req.params.id}`);
        const isProjectDeleted = await deleteProjectRelation(req.params.id, session);
        await session.commitTransaction();
        session.endSession();
        console.log(`deleteProjectByID -- User:${req.user} Succeeded to delete Project:${req.params.id}`);
        return res.status(HttpCodes.OK).send({ data: isProjectDeleted, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        await session.abortTransaction();
        session.endSession();
        console.error(`deleteProjectByID -- User:${req.user} Error while trying to delete Project:${req.params.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Failed to delete project ${req.params.id}` });
    }
};

export default {
    createProject,
    getProjectByID,
    getProjects,
    updateProjectByID,
    deleteProjectByID
};
