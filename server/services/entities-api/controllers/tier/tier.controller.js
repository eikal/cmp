
import joi from 'joi';
import Tier from '../../models/tier/tier.model.js';
import Project from '../../models/project/project.model.js';
import HttpCodes from '../../../../shared/http-status-codes.js';
import Cloudspace from '../../models/cloudspace/cloudspace.model.js';
import { getTierReleations, deleteTierRelation } from '../../helpers/queries.js';
import mongoose from 'mongoose';
const { startSession } = mongoose;

const createTier = async (req, res, next) => {
    try {
        console.log(`createTier -- User:${req.user} Trying to create new Tier:${req.body.name}`);
        const schema = joi.object().keys({
            name: joi.string().required(),
            description: joi.string().required(),
            projectID: joi.string().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`createTier -- User:${req.user} Error while trying to create new Tier:${req.body.name},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        req.body.createdBy = req.user;
        req.body.createdDate = new Date();
        req.body.updatedDate = new Date();
        const tier = new Tier(req.body);
        const isTierDocCreated = await tier.save(tier);
        if (!isTierDocCreated?._doc) {
            console.error(`createTier -- User:${req.user} Error while trying to create new Tier:${req.body.name}`);
            return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Tier creation failed' });
        }
        console.log(`createTier -- User:${req.user} Trying to relate new tier:${req.body.name} to his project:${req.body.projectID}`);
        const projectUpdated = await Project.findByIdAndUpdate(req.body.projectID, { $addToSet: { tierIDs: isTierDocCreated._doc._id.toString() } });
        if (!projectUpdated) {
            console.error(`Failed to relate new tier:${req.body.name} to his project:${req.body.projectID}`);
            return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Tier creation failed' });
        }

        console.log(`createTier -- User:${req.user} Succeeded to create new Tier:${req.body.name}`);
        return res.status(HttpCodes.OK).send({ data: isTierDocCreated._doc, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`createTier -- User:${req.user} Error while trying to create new Tier:${req.body.name},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Tier creation failed' });
    }
};

const getTierByID = async (req, res, next) => {
    try {
        console.log(`getTierByID -- User:${req.user} Trying to get Tier:${req.params.id}`);
        const tierDetails = await getTierReleations(req.params.id);
        return res.status(HttpCodes.OK).send({ data: tierDetails, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getTierByID -- User:${req.user} Error while trying to get Tier:${req.params.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Failed to get tier ${req.params.id}` });
    }
};

const getAllTiers = async (req, res, next) => {
    try {
        console.log(`getAllTiers -- User:${req.user} Trying to get all Tiers for cloudspace:${req.query.cloudspace}`);
        const schema = joi.object().keys({
            cloudspace: joi.string().required()
        });
        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`getAllTiers -- User:${req.user} Trying to get tiers for cloudspace,Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const isCloudspaceIsFound = await Cloudspace.findById(req.query.cloudspace);
        if (!isCloudspaceIsFound) {
            throw `getAllTiers -- Faild to find cloudspace:${req.query.cloudspace}`;
        }
        const isProjectsFound = await Project.find({ _id: { $in: isCloudspaceIsFound._doc.projectIDs } });
        if (!isProjectsFound) {
            throw `getAllTiers -- Faild to find projects in cloudspace:${req.query.cloudspace}`;
        }
        const tierIDs = [];
        for (const project of isProjectsFound) {
            for (const tierID of project._doc.tierIDs) {
                tierIDs.push(tierID);
            }
        }
        const foundTiers = await Tier.find({ _id: { $in: tierIDs } });
        if (!foundTiers || foundTiers.length === 0) {
            return res.status(HttpCodes.OK).send({ data: [], statusCode: HttpCodes.OK, message: null });
        }
        console.log(`getAllTiers -- User:${req.user} Succeeded  to get all Tiers`);
        const promises = [];
        for (const foundTier of foundTiers) {
            promises.push(getTierReleations(foundTier._doc._id.toString()));
        }
        const response = await Promise.all(promises);
        return res.status(HttpCodes.OK).send({ data: response, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getAllTiers -- User:${req.user} Error while trying  to get all Tiers,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Failed to get tier ${req.body.id}` });
    }
};

const updateTierByID = async (req, res, next) => {
    try {
        console.log(`updateTierByID -- User:${req.user} Trying to update Tier:${req.params.id}, Tier params: ${req.body.name},${req.body.description}`);
        const schema = joi.object().keys({
            name: joi.string().required(),
            description: joi.string().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`updateTierByID -- User:${req.user} Error while trying to update Tier:${req.params.id},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        req.body.updatedDate = new Date();
        req.body.createdBy = req.user;
        const isTierUpdated = await Tier.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (isTierUpdated) {
            console.log(`updateTierByID -- User:${req.user} Succeeded to update Tier:${req.params.id}`);
            return res.status(HttpCodes.OK).send({ data: isTierUpdated, statusCode: HttpCodes.OK, message: null });
        }
        console.error(`updateTierByID -- User:${req.user} Error while trying to update Tier:${req.params.id}`);
        return res.status(HttpCodes.NOT_FOUND).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Tier:${req.params.id} not found` });
    } catch (ex) {
        console.error(`updateTierByID -- User:${req.user} Error while trying to update Tier:${req.params.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Failed to update tier ${req.params.id}` });
    }
};

const deleteTierByID = async (req, res, next) => {
    const session = await startSession();
    try {
        console.log(`deleteTierByID -- User:${req.user} Trying to delete Tier:${req.params.id}`);
        const schema = joi.object().keys({
            projectID: joi.string().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`deleteTierByID -- User:${req.user} Trying to delete Tier,Error:${result.error}`);
            session.endSession();
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        session.startTransaction();
        const isTierDeleted = await deleteTierRelation(req.params.id, req.body.projectID, session);
        await session.commitTransaction();
        session.endSession();
        console.log(`deleteTierByID -- User:${req.user} Succeeded to delete Tier:${req.params.id}`);
        return res.status(HttpCodes.OK).send({ data: isTierDeleted, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        await session.abortTransaction();
        session.endSession();
        console.error(`deleteTierByID -- User:${req.user} Error while trying to delete Tier:${req.params.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Failed to delete tier ${req.params.id}` });
    }
};

export default {
    createTier,
    getTierByID,
    getAllTiers,
    updateTierByID,
    deleteTierByID
};
