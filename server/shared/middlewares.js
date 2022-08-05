import jwt from 'jsonwebtoken';
import HttpCodes from './http-status-codes.js';

const missingErrorMessage = 'No token provided. Please add `x-access-token` header value';
const verifyErrorMessage = 'Failed to authenticate token';
const notAutorizedErrorMessage = 'User does not have permission to access';

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies['x-access-token'] || req.body['x-access-token'];
    if (!token) {
      console.error(`verifyToken -- token is missing in request,Req:${JSON.stringify(req.body)}`);
      return res.status(HttpCodes.UNAUTHORIZE).send({ data: null, statusCode: HttpCodes.UNAUTHORIZE, message: missingErrorMessage });
    }

    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
      if (err) {
        console.error(`verifyToken -- Error while trying to verify token from coockie,Error:${JSON.stringify(err)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.FORBIDDEN, message: verifyErrorMessage });
      }
      req.user = decoded.id;
      req.role = decoded.role;
      next();
    });
  } catch (ex) {
    console.error(`verifyToken -- Error while trying to verify token from coockie,Error:${JSON.stringify(ex)}`);
    return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.FORBIDDEN, message: verifyErrorMessage });
  }
};

export const verifySuperAdmin = (req, res, next) => {
  try {
    const token = req.cookies['x-access-token'] || req.body['x-access-token'];
    if (!token) {
      console.error(`verifySuperAdmin -- token is missing in request,Req:${JSON.stringify(req.body)}`);
      return res.status(HttpCodes.UNAUTHORIZE).send({ data: null, statusCode: HttpCodes.UNAUTHORIZE, message: missingErrorMessage });
    }

    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
      if (err) {
        console.error(`verifySuperAdmin -- Error while trying to verify token from coockie,Error:${JSON.stringify(err)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.FORBIDDEN, message: verifyErrorMessage });
      }
      if (decoded.role !== 'superAdmin') {
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.FORBIDDEN, message: notAutorizedErrorMessage });
      }
      req.user = decoded.id;
      req.role = decoded.role;
      next();
    });
  } catch (ex) {
    console.error(`verifySuperAdmin -- Error while trying to verify token from coockie,Error:${JSON.stringify(ex)}`);
    return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.FORBIDDEN, message: verifyErrorMessage });
  }
};
