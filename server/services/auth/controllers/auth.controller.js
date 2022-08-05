
import joi from 'joi';
import jwt from 'jsonwebtoken';
import { handleAuthUser } from '../integrations/active-directory.js';
import { checkIfUserExistInRole, checkIfUserExistInRoleGroups } from '../helpers/helpers.js';
import HttpCodes from '../../../shared/http-status-codes.js';

const login = async (req, res, next) => {
	try {
		console.log(`login -- User:${req.body.username} trying to login`);
		const schema = joi.object().keys({
			username: joi.string().required(),
			password: joi.string().required()
		});

		const result = schema.validate(req.body);
		if (result.error) {
			console.error(`login -- Error while User:${req.body.username} trying to login,Error:${result.error}`);
			return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
		}

		const username = `${process.env.LDAP_DOMAIN}\\${req.body.username}`;
		const usernameForGroup = req.body.username;
		const password = req.body.password;

		const isAuthResponse = await handleAuthUser(username, usernameForGroup, password);
		if (isAuthResponse.isAuth && isAuthResponse.role === 'superAdmin') { // check if user is an super admin user
			const token = jwt.sign({ id: isAuthResponse.username, role: isAuthResponse.role }, process.env.JWT_SECRET, { expiresIn: 86400 }); // expires in 24 hours;
			return res.status(HttpCodes.OK).send({ data: { token: token, role: isAuthResponse.role, username: isAuthResponse.username }, statusCode: HttpCodes.OK, message: null });
		};
		const userCloudspaces = await checkIfUserExistInRole(usernameForGroup); // check if user exist in any role system
		if (userCloudspaces) {
			const token = jwt.sign({ id: isAuthResponse.username, role: 'basic' }, process.env.JWT_SECRET, { expiresIn: 86400 }); // expires in 24 hours;
			return res.status(HttpCodes.OK).send({ data: { token: token, role: 'basic', username: isAuthResponse.username }, statusCode: HttpCodes.OK, message: null });
		}
		const groupsCludspaces = await checkIfUserExistInRoleGroups(isAuthResponse.groups, usernameForGroup); // check if user exist to any roles groups
		if (groupsCludspaces) {
			const token = jwt.sign({ id: isAuthResponse.username, role: 'basic' }, process.env.JWT_SECRET, { expiresIn: 86400 }); // expires in 24 hours;
			return res.status(HttpCodes.OK).send({ data: { token: token, role: 'basic', username: isAuthResponse.username }, statusCode: HttpCodes.OK, message: null });
		}
		return res.status(HttpCodes.UNAUTHORIZE).send({ data: null, statusCode: HttpCodes.UNAUTHORIZE, message: 'User is not associated to any role, Please contact administrator' });
	} catch (ex) {
		console.error(`login -- Error while User:${req.body.username} trying to login,Error:${JSON.stringify(ex)}`);
		return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: ex.message ? ex.message : 'Unauthorized User' });
	}
};

const logout = async (req, res, next) => {
	try {
		res.clearCookie('x-access-token');
		return res.status(200).send({ data: null, statusCode: HttpCodes.OK, message: null });
	} catch (ex) {
		console.error(`logout -- Error while User:${req.body.username} trying to logout,Error:${JSON.stringify(ex)}`);
		return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: null });
	}
};

export default { login, logout };
