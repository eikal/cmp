import path from 'path';
import moment from 'moment';
import { execSsh } from '../helpers/helpers.js';

/**
 * limit the amount of backups created to a file
 * @param {String} cloudspaceID - cloudspace ID
 * @param {String} hostname - file server location
 * @param {String} filePath - file path location
 * @param {String} fileName - file name
 */
export const limitBackups = async (cloudspaceID, hostname, filePath, fileName) => {
    try {
        console.log(`limitBackups -- trying to limit backups for file ${filePath}${fileName} at server ${hostname}`);
        const baseFileName = path.parse(fileName).name;
        const execSshRes = await execSsh(cloudspaceID, hostname, 'genericAction', `sudo find ${filePath} -name '${baseFileName}*_bkp*' -type f -printf "\n%CD %CT %f" | sort -n -r`);
        if (execSshRes.stderr) {
            console.error(`limitBackups -- failed to find backups for file ${filePath}${fileName} at server ${hostname}`);
            throw execSshRes.stderr;
        }
        const backups = [];
        const fileRows = execSshRes.stdout.split('\n'); // each file in a new line
        for (const fileSelected of fileRows) {
            const fileNameArrayString = fileSelected.split(' '); // "% Sun 09 Jan 2022 04:37:12 AM EST xxxx.properties._bkp_2022-01-09T09:37:20"
            const fileName = fileNameArrayString[fileNameArrayString.length - 1];
            backups.push(fileName);
        }
        if (backups.length > 2) {
            // delete the earlier backup
            const execSshDeleteResult = await execSsh(cloudspaceID, hostname, 'genericAction', `sudo rm -f ${filePath}${backups[2]}`);
            if (execSshDeleteResult.stderr) {
                console.error(`limitBackups -- failed to delete file ${filePath}${fileName} at server ${hostname}`);
                throw execSshDeleteResult.stderr;
            } else {
                console.log(`limitBackups -- success delete backup ${filePath}${backups[2]} for file ${filePath}${fileName} at server ${hostname}`);
                return backups[2];
            }
        }
    } catch (ex) {
        const err = `limitBackups -- Error while trying to limit the backups for file: ${filePath}${fileName} , Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

/**
 * backup the current file and persist the new content on it
 * @param {String} cloudspaceID - cloudspace ID
 * @param {String} hostname - file server location
 * @param {String} filePath - file path location
 * @param {String} fileName - file name
 * @param {String} encodedData - file content to save in base64 format
 * @returns {String} bkpFileName - the new backup file name
 */
export const saveAndBackup = async (cloudspaceID, hostname, filePath, fileName, encodedData) => {
    try {
        console.log(`saveAndBackup -- trying to save backup for file ${filePath}${fileName} at server ${hostname}`);
        const bkpFileName = buildBackupName(fileName);
        const commandArray = [{
            command: `sudo cp ${filePath}${fileName} ${filePath}${bkpFileName}`,
            rollback: `sudo rm -f ${filePath}${bkpFileName}`
        },
        {
            command: `sudo bash -c "echo '${encodedData}' | base64 --decode > ${filePath}${fileName}"`,
            rollback: ''
        }];
        for (const operation of commandArray) {
            const res = await execSsh(cloudspaceID, hostname, null, operation.command);
            if (res.stderr) {
                for (const operation of commandArray) {
                    if (operation.rollback !== '') {
                        await execSsh(cloudspaceID, hostname, null, operation.rollback);
                    }
                }
                throw res.stderr;
            }
        }
        console.log(`saveAndBackup -- success saving backup for file ${filePath}${fileName} at server ${hostname}`);
        return `${filePath}${bkpFileName}`;
    } catch (ex) {
        const err = `saveAndBackup -- Error while trying to save and backup file: ${filePath}${fileName} , Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};

/**
 * prepare file name for the new backup. i.e: application.properties -> application.properties._bkp_2022-01-09T08:39:55
 * @param {String} fileName - file name
 * @returns backup file name
 */
const buildBackupName = (fileName) => {
    try {
        const baseFileName = path.parse(fileName).name;
        const suffix = path.parse(fileName).ext;
        return baseFileName + suffix + '.' + '_bkp_' + moment().format('DD.MM.YYYY-HH.mm.ss');
    } catch (ex) {
        const err = `getBackupName -- Error while trying to build backup file name for: ${fileName} , Error: ${JSON.stringify(ex)}`;
        console.error(err);
        throw err;
    }
};
