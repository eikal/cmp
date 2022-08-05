
import joi from 'joi';
import HttpCodes from '../../../shared/http-status-codes.js';
import { startSync } from '../job/index.js';
import SourceSync from '../models/index.model.js';
import { fetchBranchList } from '../helper/fetch-branches.js';

const sync = async (req, res, next) => {
	try {
		const schema = joi.object().keys({
			branches: joi.array().required().min(1)
		});
		const result = schema.validate(req.body);
		if (result.error) {
			console.error(`sync -- User:${req.user} Error while Trying to use branches: ${req.body.branches},Error:${result.error}`);
			return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
		}

		startSync(req.body.branches);
		return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
	} catch (ex) {
		console.error(`sync -- Error while User:${req.user} trying to sync,Error:${JSON.stringify(ex)}`);
		return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
	}
};

const branchList = async (req, res, next) => {
	try {
		console.log(`branchList -- User:${req.user} Trying to get branches from bankingSolutions repo`);
		const branches = await fetchBranchList();
		return res.status(HttpCodes.OK).send({ data: branches, statusCode: HttpCodes.OK, message: null });
	} catch (ex) {
		console.error(`branchList -- Error while User:${req.user} trying to fetch branchList ,Error:${JSON.stringify(ex)}`);
		return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
	}
};

const checkHealth = async (req, res, next) => {
	try {
		const lastSourceSyncUpdate = await SourceSync.find().sort({ _id: -1 }).limit(1);
		if (lastSourceSyncUpdate && Array.isArray(lastSourceSyncUpdate) && lastSourceSyncUpdate.length > 0) {
			return res.status(HttpCodes.OK).send({ data: lastSourceSyncUpdate[0], statusCode: HttpCodes.OK, message: null });
		}
		return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
	} catch (ex) {
		return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
	}
};

export default { sync, branchList, checkHealth };
