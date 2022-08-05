
import joi from 'joi';
import Key from '../models/keys.model.js';
import HttpCodes from '../../../shared/http-status-codes.js';
import { execSshCommand, getSshConnection } from '../../../shared/ssh-client.js';

const encrypt = async (req, res, next) => {
	try {
		console.log(`encrypt -- User:${req.user} Trying to encrypt value:${req.body.value}`);
		const schema = joi.object().keys({
			value: joi.string().required()
		});

		const result = schema.validate(req.body);
		if (result.error) {
			console.error(`encrypt -- User:${req.user} Error while trying to encrypt value:${req.body.value},Error:${result.error}`);
			return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
		}
		// First checking if this key already encrypted , otherwise ssh to autolab server and ecrypt
		const docIsFonunded = await Key.findOne({ key: req.body.value });
		if (docIsFonunded?._doc?.key) {
			return res.status(HttpCodes.OK).send({ data: docIsFonunded._doc.encryptKey, statusCode: HttpCodes.OK, message: null });
		}
		const connection = await getSshConnection(process.env.AUTOLAB_MAIN_SERVER, process.env.AUTOLAB_MAIN_SERVER_USERNAME, process.env.AUTOLAB_MAIN_SERVER_PASSWORD);
		const { stdout } = await execSshCommand(connection, `eyaml encrypt -s ${req.body.value} --gpg-recipients-file=./hiera-eyaml-gpg.recipients`, `/home/${process.env.AUTOLAB_MAIN_SERVER_USERNAME}/controlrepo/hieradata`);
		if (stdout && stdout !== '') {
			const searchTerm = 'string: ';
			const searchIndex = stdout.indexOf(searchTerm);
			let strOut = stdout.substr(searchIndex + searchTerm.length);
			strOut = strOut.replace(/\s/g, '');
			const enc = strOut.split('ORblock')[0];
			const KeyHieraObj = new Key({
				key: req.body.value,
				encryptKey: enc,
				updatedDate: new Date()
			});
			const docIsUpdated = await Key.updateOne({ key: req.body.value }, KeyHieraObj, { upsert: true, new: true, setDefaultsOnInsert: true });
			if (docIsUpdated?.ok) {
				console.log(`encrypt -- User:${req.user} Sucsseded to save key:${req.body.value} into db collection: key_hieras`);
				return res.status(HttpCodes.OK).send({ data: enc, statusCode: HttpCodes.OK, message: null });
			}
			console.error(`encrypt -- User:${req.user} Failed to save key:${req.body.value} into db collection: key_hieras`);
			return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Encryption failed' });
		}
		return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Encryption failed' });
	} catch (ex) {
		console.error(`encrypt -- User:${req.user} Error while trying to encrypt value:${req.body.value},Error:${JSON.stringify(ex)}`);
		return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Encryption failed' });
	}
};

const decrypt = async (req, res, next) => {
	try {
		console.log(`decrypt -- User:${req.user} Trying to decrypt:${req.body.key}`);
		const schema = joi.object().keys({
			key: joi.string().required()
		});

		const result = schema.validate(req.body);
		if (result.error) {
			console.error(`decrypt -- User:${req.user} Error while trying to decrypt key:${req.body.key},Error:${result.error}`);
			return res.status(HttpCodes.BAD_REQUEST).send({ data: null, statusCode: HttpCodes.BAD_REQUEST, message: result.error });
		}
		const docIsFonunded = await Key.findOne({ encryptKey: req.body.key });
		if (docIsFonunded?._doc?.key) {
			return res.status(HttpCodes.OK).send({ data: docIsFonunded._doc.key, statusCode: HttpCodes.OK, message: null });
		}

		return res.status(HttpCodes.NOT_FOUND).send({ data: null, statusCode: HttpCodes.NOT_FOUND, message: 'Decryption failed' });
	} catch (ex) {
		console.error(`encrypt -- User:${req.user} Error while trying to encrypt value:${req.body.value},Error:${JSON.stringify(ex)}`);
		return res.status(HttpCodes.INTERNAL_ERROR).send({ data: null, statusCode: HttpCodes.INTERNAL_ERROR, message: 'Decryption failed' });
	}
};

export default { encrypt, decrypt };
