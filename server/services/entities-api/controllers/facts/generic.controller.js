
import joi from 'joi';
import { validateFactType, validateJoiSchema, getModalByFactType } from '../../helpers/validations.js';
import HttpCodes from '../../../../shared/http-status-codes.js';
import FACTS from '../../config/facts.js';

const createGenericFact = async (req, res, next) => {
    try {
        console.log(`createGenericFact -- User:${req.user} Trying to create fact type:${req.params.type} called:${req.body.name}`);
        req.body.factType = req.params.type;
        const schema = validateJoiSchema(req.body);
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`createGenericFact -- User:${req.user} Error while trying to create fact type:${req.body.factType} called:${req.body.name},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const isValidFactType = validateFactType(req.body.factType);
        if (!isValidFactType) {
            console.error(`createGenericFact -- User:${req.user} Error while trying to create fact type:${req.body.factType} called:${req.body.name},fact is not valid`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: 'fact is not valid' });
        }
        const GenericModal = getModalByFactType(req.body.factType);
        req.body.createdDate = new Date();
        req.body.updatedDate = new Date();
        const genericObj = new GenericModal(req.body);
        const isGenericDocCreated = await genericObj.save(genericObj);
        if (isGenericDocCreated?._doc) {
            console.log(`createGenericFact -- User:${req.user} Succeeded to create fact type:${req.body.factType} called:${req.body.name}`);
            return res.status(HttpCodes.OK).send({ data: isGenericDocCreated._doc, statusCode: HttpCodes.OK, message: null });
        }
        console.error(`createGenericFact -- User:${req.user} Error while trying to create fact type:${req.body.factType} called:${req.body.name}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Generic fact creation failed' });
    } catch (ex) {
        console.error(`createGenericFact -- User:${req.user} Error while trying to create fact type:${req.body.factType} called:${req.body.name},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Generic fact creation failed' });
    }
};

const getGenericFactByType = async (req, res, next) => {
    try {
        console.log(`getGenericFactByType -- User:${req.user} Trying to get all facts from type:${req.params.type}`);
        const schema = joi.object().keys({
            type: joi.string().required()
        });

        const result = schema.validate(req.params);
        if (result.error) {
            console.error(`getGenericFactByType -- User:${req.user} Error while trying to get all facts from type:${req.params.type},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const GenericModal = getModalByFactType(req.params.type);
        const factValus = await GenericModal.find({});
        if (factValus) {
            console.log(`getGenericFactByType -- User:${req.user} Succeeded to get all facts from type:${req.params.type},Found:${factValus.length}`);
            return res.status(HttpCodes.OK).send({ data: factValus, statusCode: HttpCodes.OK, message: null });
        }
        console.error(`getGenericFactByType -- User:${req.user} Error while trying  to get all facts from type:${req.params.type}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Faild to get facts by type:${req.params.type}` });
    } catch (ex) {
        console.error(`getGenericFactByType -- User:${req.user} Error while trying  to get all facts from type:${req.params.type},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Faild to get facts by type:${req.params.type}` });
    }
};

const getGenericFactByTypeAndID = async (req, res, next) => {
    try {
        console.log(`getGenericFactByTypeAndID -- User:${req.user} Trying to get fact from type:${req.params.type} by id:${req.params.id}`);
        const schema = joi.object().keys({
            type: joi.string().required(),
            id: joi.string().required()
        });

        const result = schema.validate(req.params);
        if (result.error) {
            console.error(`getGenericFactByTypeAndID -- User:${req.user} Error while trying to get fact from type:${req.params.type} by id:${req.params.id},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const GenericModal = getModalByFactType(req.params.type);
        const factValueIsFounded = await GenericModal.findById(req.params.id);
        if (factValueIsFounded) {
            console.log(`getGenericFactByTypeAndID -- User:${req.user} Succeeded to get fact from type:${req.params.type} by id:${req.params.id},Fact:${factValueIsFounded.name}`);
            return res.status(HttpCodes.OK).send({ data: factValueIsFounded, statusCode: HttpCodes.OK, message: null });
        }
        console.error(`getGenericFactByTypeAndID -- User:${req.user} Error while trying  to get fact from type:${req.params.type} by id:${req.params.id}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Faild to get facts by type:${req.params.type} and by id:${req.params.id}` });
    } catch (ex) {
        console.error(`getGenericFactByTypeAndID -- User:${req.user} Error while trying to get fact from type:${req.params.type} by id:${req.params.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Faild to get facts by type:${req.params.type} and by id:${req.params.id}` });
    }
};

const updateGenericFactByTypeAndID = async (req, res, next) => {
    try {
        console.log(`updateGenericFactByTypeAndID -- User:${req.user} Trying to update fact type:${req.params.type} with ID:${req.params.id}`);
        req.body.factType = req.params.type;
        const schema = validateJoiSchema(req.body);
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`updateGenericFactByTypeAndID -- User:${req.user} Error while trying to update fact type:${req.params.type} with ID:${req.params.id},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const isValidFactType = validateFactType(req.body.factType);
        if (!isValidFactType) {
            console.error(`updateGenericFactByTypeAndID -- User:${req.user} Error while trying to update fact type:${req.params.type} with ID:${req.params.id},fact is not valid`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: 'fact is not valid' });
        }
        const GenericModal = getModalByFactType(req.params.type);
        req.body.updatedDate = new Date();
        const isGenericDocUpdated = await GenericModal.findByIdAndUpdate(req.params.id, req.body, { useFindAndModify: false, new: true });
        if (isGenericDocUpdated?._doc) {
            console.log(`updateGenericFactByTypeAndID -- User:${req.user} Succeeded to update fact type:${req.params.type} with ID:${req.params.id}`);
            return res.status(HttpCodes.OK).send({ data: isGenericDocUpdated._doc, statusCode: HttpCodes.OK, message: null });
        }
        console.error(`updateGenericFactByTypeAndID -- User:${req.user} Error while trying to update fact type:${req.params.type} with ID:${req.params.id},not exist!`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Generic fact update failed' });
    } catch (ex) {
        console.error(`updateGenericFactByTypeAndID -- User:${req.user} Error while trying to update fact type:${req.params.type} with ID:${req.params.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Generic fact update failed' });
    }
};

const deleteGenericFactByTypeAndID = async (req, res, next) => {
    try {
        console.log(`deleteGenericFactByTypeAndID -- User:${req.user} Trying to delete fact type:${req.params.type} with ID:${req.params.id}`);
        req.body.factType = req.params.type;
        const schema = joi.object().keys({
            type: joi.string().required(),
            id: joi.string().required()
        });
        const result = schema.validate(req.params);
        if (result.error) {
            console.error(`deleteGenericFactByTypeAndID -- User:${req.user} Error while trying to delete fact type:${req.params.type} with ID:${req.params.id},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const isValidFactType = validateFactType(req.body.factType);
        if (!isValidFactType) {
            console.error(`deleteGenericFactByTypeAndID -- User:${req.user} Error while trying to delete fact type:${req.params.type} with ID:${req.params.id},fact is not valid`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: 'fact is not valid' });
        }
        const GenericModal = getModalByFactType(req.params.type);
        req.body.updatedDate = new Date();
        const isGenericDocDeleted = await GenericModal.findByIdAndRemove(req.params.id);
        if (isGenericDocDeleted?._doc) {
            console.log(`deleteGenericFactByTypeAndID -- User:${req.user} Succeeded to delete fact type:${req.params.type} with ID:${req.params.id}`);
            return res.status(HttpCodes.OK).send({ data: isGenericDocDeleted._doc, statusCode: HttpCodes.OK, message: null });
        }
        console.error(`deleteGenericFactByTypeAndID -- User:${req.user} Error while trying to delete fact type:${req.params.type} with ID:${req.params.id},not exist!`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Generic fact delete failed' });
    } catch (ex) {
        console.error(`deleteGenericFactByTypeAndID -- User:${req.user} Error while trying to delete fact type:${req.params.type} with ID:${req.params.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Generic fact delete failed' });
    }
};

const getGenericFacts = async (req, res, next) => {
    try {
        console.log(`getGenericFacts -- User:${req.user} Trying to get all generic facts`);
        const facts = {};
        for (const fact in FACTS) {
            const GenericModal = getModalByFactType(FACTS[fact]);
            const factValueIsFounded = await GenericModal.find({});
            if (factValueIsFounded) {
                facts[FACTS[fact]] = factValueIsFounded;
            }
        }
        return res.status(HttpCodes.OK).send({ data: facts, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getGenericFacts -- User:${req.user} Error while trying to get all generic facts,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get all facts' });
    }
};
export default {
    createGenericFact,
    getGenericFactByType,
    getGenericFactByTypeAndID,
    updateGenericFactByTypeAndID,
    deleteGenericFactByTypeAndID,
    getGenericFacts
};
