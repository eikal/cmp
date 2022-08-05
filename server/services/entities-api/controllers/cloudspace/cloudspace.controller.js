
import joi from 'joi';
import Cloudspace from '../../models/cloudspace/cloudspace.model.js';
import Role from '../../../auth/models/role.model.js';
import HttpCodes from '../../../../shared/http-status-codes.js';
import { getCloudspaceRelations, getCloudspacesBySpecUser, deleteCloudspaceRelation } from '../../helpers/queries.js';
import mongoose from 'mongoose';
const { startSession } = mongoose;

const getCloudspacesByUser = async (req, res, next) => {
    try {
        console.log(`getCloudspacesByUser -- User:${req.user} Trying to get all Cloudspaces for user:${req.user}`);
        const cloudspaces = await getCloudspacesBySpecUser(req.user, req.role);
        return res.status(HttpCodes.OK).send({ data: cloudspaces, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getCloudspacesByUser -- User:${req.user} Error while trying to get Cloudspaces,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get cloudspaces' });
    }
};

const getCloudspacesBySuperAdmin = async (req, res, next) => {
    try {
        console.log(`getCloudspacesBySuperAdmin -- User:${req.user} Trying to get all Cloudspaces`);
        const cloudspaces = await Cloudspace.find({});
        if (!cloudspaces || !Array.isArray(cloudspaces)) {
            console.error(`getCloudspacesBySuperAdmin -- User:${req.user} Error while trying to get all Cloudspaces`);
            return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get cloudspaces' });
        }
        const promises = [];
        for (const cloudspace of cloudspaces) {
            promises.push(getCloudspaceRelations(cloudspace));
        }
        const results = await Promise.all(promises);
        console.log(`getCloudspacesBySuperAdmin -- User:${req.user} Found ${cloudspaces.length} Cloudspaces`);
        return res.status(HttpCodes.OK).send({ data: results, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getCloudspacesBySuperAdmin -- User:${req.user} Error while trying to get Cloudspaces,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get cloudspaces' });
    }
};

const createCloudspace = async (req, res, next) => {
    const session = await startSession();
    try {
        console.log(`createCloudspace -- User:${req.user} Trying to create new Cloudspace:${req.body.name}`);
        const schema = joi.object().keys({
            name: joi.string().required().min(2),
            description: joi.string().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`createCloudspace -- User:${req.user} Error while trying to create new Cloudspace:${req.body.name},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        req.body.createdBy = req.user;
        session.startTransaction();
        const cloudspace = new Cloudspace(req.body);
        const isCloudspaceDocCreated = await cloudspace.save({ session });
        if (!isCloudspaceDocCreated?._doc) {
            throw `Failed to create cloudspace:${req.body.name}`;
        }
        const role = new Role({ cloudspaceID: isCloudspaceDocCreated._doc._id.toString() });
        const isRoleCreated = await role.save({ session });
        if (!isRoleCreated?._doc) {
            throw `Failed to create role for cloudspace:${req.body.name}`;
        }
        await session.commitTransaction();
        session.endSession();
        console.log(`createCloudspace -- User:${req.user} Succeeded to create new Cloudspace:${req.body.name}`);
        return res.status(HttpCodes.OK).send({ data: isCloudspaceDocCreated._doc, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        await session.abortTransaction();
        session.endSession();
        console.error(`createCloudspace -- User:${req.user} Error while trying to create new Cloudspace:${req.body.name},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Cloudspace creation failed' });
    }
};

const updateCloudspaceByID = async (req, res, next) => {
    try {
        console.log(`updateCloudspaceByID -- User:${req.user} Trying to update Cloudspace:${req.params.id}, Cloudspace params: ${req.body.name},${req.body.description}`);
        const schema = joi.object().keys({
            name: joi.string().required().min(2),
            description: joi.string().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`updateCloudspaceByID -- User:${req.user} Error while trying to update Cloudspace:${req.params.id},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        req.body.updatedDate = new Date();
        req.body.createdBy = req.user;
        const isCloudspaceUpdated = await Cloudspace.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (isCloudspaceUpdated) {
            console.log(`updateCloudspaceByID -- User:${req.user} Succeeded to update Cloudspace:${req.params.id}`);
            return res.status(HttpCodes.OK).send({ data: isCloudspaceUpdated, statusCode: HttpCodes.OK, message: null });
        }
        console.error(`updateCloudspaceByID -- User:${req.user} Error while trying to update Cloudspace:${req.params.id}`);
        return res.status(HttpCodes.NOT_FOUND).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Cloudspace:${req.params.id} not found` });
    } catch (ex) {
        console.error(`updateCloudspaceByID -- User:${req.user} Error while trying to update Cloudspace:${req.params.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Failed to update Cloudspace ${req.params.id}` });
    }
};

const deleteCloudspaceByID = async (req, res, next) => {
    const session = await startSession();
    try {
        console.log(`deleteCloudspaceByID -- User:${req.user} Trying to delete Cloudspace:${req.params.id}`);
        session.startTransaction();
        await deleteCloudspaceRelation(req.params.id);
        console.log(`deleteCloudspaceByID -- User:${req.user} Succeeded to delete Cloudspace:${req.params.id}`);
        await session.commitTransaction();
        session.endSession();
        return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        await session.abortTransaction();
        session.endSession();
        console.error(`deleteCloudspaceByID -- User:${req.user} Error while trying to delete Cloudspace:${req.params.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Failed to delete Cloudspace ${req.params.id}` });
    }
};

export default {
    getCloudspacesByUser,
    getCloudspacesBySuperAdmin,
    createCloudspace,
    updateCloudspaceByID,
    deleteCloudspaceByID
};
