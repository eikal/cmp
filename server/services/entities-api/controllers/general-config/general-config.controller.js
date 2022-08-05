import HttpCodes from '../../../../shared/http-status-codes.js';
import { getBuildDetails } from '../../helpers/bitbucket.js';
import joi from 'joi';
import { sendMail } from '../../../../shared/mailer/mailer.js';
import { updateSshKeyByCloudspaceID, getSshKeyByCloudspaceID, deleteSshKeyByCloudspaceID } from '../../helpers/configuration.js';

const getGeneralConfig = async (req, res, next) => {
    try {
        console.log(`getGeneralConfig -- User:${req.user} Trying to get all configs`);
        if (req.role === 'superAdmin') {
            const obj = {
                DATA_CENTER: process.env.DATA_CENTER,
                DB_NAME: process.env.DB_NAME,
                DB_HOSTNAME: process.env.DB_HOSTNAME,
                DB_PORT: process.env.DB_PORT,
                LDAP_URL: process.env.LDAP_URL,
                LDAP_USER: process.env.LDAP_USER,
                LDAP_DOMAIN: process.env.LDAP_DOMAIN,
                LDAP_PASSWORD: process.env.LDAP_PASSWORD,
                BASE_DN: process.env.BASE_DN,
                JWT_SECRET: process.env.JWT_SECRET,
                SERVICE_USERNAME: process.env.SERVICE_USERNAME,
                REPO_APIKEY: process.env.REPO_APIKEY,
                SOURCE_SYNC_BS_DIR_PATH: process.env.SOURCE_SYNC_BS_DIR_PATH,
                SOURCE_SYNC_MONITOR_PATH: process.env.SOURCE_SYNC_MONITOR_PATH,
                MONITORING_BRANCH: process.env.MONITORING_BRANCH,
                AUTOLAB_MAIN_SERVER: process.env.AUTOLAB_MAIN_SERVER,
                AUTOLAB_MAIN_SERVER_USERNAME: process.env.AUTOLAB_MAIN_SERVER_USERNAME,
                AUTOLAB_MAIN_SERVER_PASSWORD: process.env.AUTOLAB_MAIN_SERVER_PASSWORD,
                CMP_PATH: process.env.CMP_PATH,
                FOREMAN_USERNAME: process.env.FOREMAN_USERNAME,
                FOREMAN_PASSWORD: process.env.FOREMAN_PASSWORD,
                FOREMAN_URL: process.env.FOREMAN_URL,
                PROMETHEUS_URL: process.env.PROMETHEUS_URL,
                CMP_ROOT_USER: process.env.CMP_ROOT_USER,
                CMP_ROOT_KEY: process.env.CMP_ROOT_KEY,
                KUBE_DASHBOARD: process.env.KUBE_DASHBOARD,
                ORACLE_HOME: process.env.ORACLE_HOME,
                SMTP_SERVER: process.env.SMTP_SERVER
            };
            return res.status(HttpCodes.OK).send({ data: obj, statusCode: HttpCodes.OK, message: null });
        } else {
            const obj = {
                DATA_CENTER: process.env.DATA_CENTER
            };
            return res.status(HttpCodes.OK).send({ data: obj, statusCode: HttpCodes.OK, message: null });
        };
    } catch (ex) {
        console.error(`getGeneralConfig -- User:${req.user} Error while trying  to get all configs,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Faild to get general config' });
    }
};

const getAboutDetails = async (req, res, next) => {
    try {
        console.log(`getAboutDetails -- User:${req.user} Trying to get all about details`);
        const buildDetails = await getBuildDetails();
        console.log(`getAboutDetails -- found about details:${JSON.stringify(buildDetails)}`);
        return res.status(HttpCodes.OK).send({ data: buildDetails, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getAboutDetails -- User:${req.user} Error while trying  to get all about details,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Faild to get about details' });
    }
};

const sendEmail = async (req, res, next) => {
    try {
        const schema = joi.object().keys({
            to: joi.string().required(),
            subject: joi.string().required(),
            body: joi.string().required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`sendMail -- User:${req.user} Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        await sendMail(req.body.to, req.body.subject, req.body.body);
        return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`sendMail -- User:${req.user} Error while trying  to send mail,Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Faild to send mail' });
    }
};

const updateSshKey = async (req, res, next) => {
    try {
        console.log(`updateSshKey -- User:${req.user} Trying to update sshKey for cloudspace:${req.body.cloudspaceID} with key:${req.body.username}`);
        const schema = joi.object().keys({
            cloudspaceID: joi.string().required(),
            username: joi.string().required(),
            keyPath: joi.string().required(),
            keyPass: joi.string().allow(null).allow('')
        });
        const result = schema.validate(req.body);
        if (result.error) {
            console.error(`updateSshKey -- User:${req.user} Trying to update sshKey for cloudspace:${req.body.cloudspaceID} with key:${req.body.username},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        await updateSshKeyByCloudspaceID(req.body.cloudspaceID, req.body.username, req.body.keyPath, req.body.keyPass, req.user);
        return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`updateSshKey -- User:${req.user} Trying to update sshKey for cloudspace:${req.body.cloudspaceID},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Faild to update ssh-key' });
    }
};

const getSshKey = async (req, res, next) => {
    try {
        console.log(`getSshKey -- User:${req.user} Trying to get sshKey for cloudspace:${req.params.cloudspaceID}`);
        const schema = joi.object().keys({
            cloudspaceID: joi.string().required()
        });
        const result = schema.validate(req.params);
        if (result.error) {
            console.error(`getSshKey -- User:${req.user} Trying to get sshKey for cloudspace:${req.params.cloudspaceID},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        const sshKey = await getSshKeyByCloudspaceID(req.params.cloudspaceID);
        return res.status(HttpCodes.OK).send({ data: sshKey, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`getSshKey -- User:${req.user} Trying to get sshKey for cloudspace:${req.params.cloudspaceID},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Faild to get ssh-key' });
    }
};

const deleteSshKey = async (req, res, next) => {
    try {
        console.log(`deleteSshKey -- User:${req.user} Trying to delete sshKey for cloudspace:${req.params.cloudspaceID}`);
        const schema = joi.object().keys({
            cloudspaceID: joi.string().required()
        });
        const result = schema.validate(req.params);
        if (result.error) {
            console.error(`deleteSshKey -- User:${req.user} Trying to delete sshKey for cloudspace:${req.params.cloudspaceID},Error:${result.error}`);
            return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
        }
        await deleteSshKeyByCloudspaceID(req.params.cloudspaceID);
        return res.status(HttpCodes.OK).send({ data: null, statusCode: HttpCodes.OK, message: null });
    } catch (ex) {
        console.error(`deleteSshKey -- User:${req.user} Trying to delete sshKey for cloudspace:${req.params.cloudspaceID},Error:${JSON.stringify(ex)}`);
        return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Faild to delete ssh-key' });
    }
};

export default {
    getGeneralConfig,
    getAboutDetails,
    sendEmail,
    updateSshKey,
    getSshKey,
    deleteSshKey
};
