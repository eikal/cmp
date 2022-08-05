
import joi from 'joi';
import StoryBook from '../../models/story-book/story-book.model.js';
import HttpCodes from '../../../../shared/http-status-codes.js';

const createStoryBook = async (req, res, next) => {
    try {
        console.log(`createStoryBook -- User:${req.user} Trying to create new Story book by:${req.body.name}`);
        const schema = joi.object().keys({
            projectID: joi.string().required(),
            comment: joi.string().required().min(1)
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`createStoryBook -- User:${req.user} Error while trying to create new Story book by:${req.body.name},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        req.body.createdBy = req.user;
        req.body.isEmailSent = false;
        req.body.createdDate = new Date();
        req.body.updatedDate = new Date();
        const storyBook = new StoryBook(req.body);
        const isstoryBookDocCreated = await storyBook.save(storyBook);
        if (isstoryBookDocCreated?._doc) {
            console.log(`createStoryBook -- User:${req.user} Succeeded to create new story book by:${req.body.name}`);
            return res.status(HttpCodes.OK).send({ data: isstoryBookDocCreated._doc, statusCode: HttpCodes.OK, message: null });
        }
        console.error(`createStoryBook -- User:${req.user} Error while trying to create new story book by:${req.body.name}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Story book creation failed' });
    } catch (ex) {
        console.error(`createStoryBook -- User:${req.user} Error while trying to create new story book by:${req.body.name},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Story book creation failed' });
    }
};

const getStoryBooks = async (req, res, next) => {
    try {
        console.log(`getStoryBooks -- User:${req.user} Trying to get Story-Books for Project ID:${req.query.projectID}`);
        const schema = joi.object().keys({
            projectID: joi.string().required()
        });
        const result = schema.validate(req.query);
        if (result.error) {
            console.error(`createStoryBook -- User:${req.user}  Error while trying to get Story-Books for Project ID:${req.query.projectID},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const isStoryBookFound = await StoryBook.find({ projectID: req.query.projectID }).sort({ createdDate: -1 });
        console.log(`getStoryBooks -- User:${req.user} Found ${isStoryBookFound.length} Story-Books for projectID:${req.query.projectID}`);
        return res.status(HttpCodes.OK).send({ data: isStoryBookFound, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getProjects -- User:${req.user} Error while trying to get StoryBooks for projectID:${req.query.projectID},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Failed to get Storybooks' });
    }
};

const updateStoryBookByID = async (req, res, next) => {
    try {
        console.log(`updateStoryBookByID -- User:${req.user} Trying to update Storybook:${req.params.id}`);
        const schema = joi.object().keys({
            comment: joi.string().required().min(1),
            isEmailSent: joi.boolean()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`updateStoryBookByID -- User:${req.user} Error while trying to update Storybook:${req.params.id},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        req.body.updatedDate = new Date();
        const isStoryBookUpdated = await StoryBook.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (isStoryBookUpdated) {
            console.log(`updateStoryBookByID -- User:${req.user} Succeeded to update Storybook:${req.params.id}`);
            return res.status(HttpCodes.OK).send({ data: isStoryBookUpdated, statusCode: HttpCodes.OK, message: null });
        }
        console.error(`updateStoryBookByID -- User:${req.user} Error while trying to update Storybook:${req.params.id}`);
        return res.status(HttpCodes.NOT_FOUND).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Storybook:${req.params.id} not found` });
    } catch (ex) {
        console.error(`updateStoryBookByID -- User:${req.user} Error while trying to update Storybook:${req.params.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Failed to update Storybook ${req.params.id}` });
    }
};

const deleteStoryBookByID = async (req, res, next) => {
    try {
        console.log(`deleteStoryBookByID -- User:${req.user} Trying to delete Storybook:${req.params.id}`);
        const isStoryBookDeleted = await StoryBook.findByIdAndDelete(req.params.id);
        if (isStoryBookDeleted) {
            console.log(`deleteStoryBookByID -- User:${req.user} Succeeded to delete Storybook:${req.params.id}`);
            return res.status(HttpCodes.OK).send({ data: isStoryBookDeleted, statusCode: HttpCodes.OK, message: null });
        }
        console.error(`deleteStoryBookByID -- User:${req.user} Error while trying to delete Storybook:${req.params.id}`);
        return res.status(HttpCodes.NOT_FOUND).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Storybook:${req.params.id} not found` });
    } catch (ex) {
        console.error(`deleteStoryBookByID -- User:${req.user} Error while trying to delete Storybook:${req.params.id},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: `Failed to delete Storybook ${req.params.id}` });
    }
};

export default {
    createStoryBook,
    getStoryBooks,
    deleteStoryBookByID,
    updateStoryBookByID
};
