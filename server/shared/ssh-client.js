
import { NodeSSH } from 'node-ssh';
import fs from 'fs';

/**
 * This method get ssh credentials and return ssh connection
 * @param {String} host - host to ssh
 * @param {String} username - logged in user
 * @param {String} password - paswword of the user
 */
export const getSshConnection = async (host, username, password) => {
    try {
        console.log(`getSshConnection -- Trying to ssh: ${host} with username:${username}`);
        const ssh = new NodeSSH();
        const connection = await ssh.connect({
            host: host,
            username: username,
            password: password
        });
        console.log(`getSshConnection -- Succeeded to ssh: ${host} with username:${username}`);
        return connection;
    } catch (ex) {
        const err = `getSshConnection -- Error while trying to ssh, Error: ${JSON.stringify(ex.message)}`;
        console.log(err);
        throw err;
    }
};
/**
 * This method get ssh key and return ssh connection
 * @param {String} host - host to ssh
 * @param {String} username - logged in user
 * @param {String} privateKey - privateKey
 */
export const getSshConnectionPrivateKey = async (host, username, privateKey, passphrase = null) => {
    try {
        console.log(`getSshConnectionPrivateKey -- Trying to ssh: ${host} with username:${username}`);
        const ssh = new NodeSSH();
        const sshConfig = {
            host: host,
            username: username,
            privateKey: fs.readFileSync(privateKey, 'utf-8')
        };
        if (passphrase) {
            sshConfig.passphrase = passphrase;
        }
        const connection = await ssh.connect(sshConfig);
        console.log(`getSshConnectionPrivateKey -- Succeeded to ssh: ${host} with username:${username}`);
        return connection;
    } catch (ex) {
        const err = `getSshConnectionPrivateKey -- Error while trying to ssh, Error: ${JSON.stringify(ex.message)}`;
        console.error(err);
        throw err;
    }
};
/**
 * This method get command and execute this command on the target host
 * @param {Object} connection - ssh connection
 * @param {String} command - executable command
 * @param {String} cwd - execution path
 */
export const execSshCommand = async (connection, command, cwd) => {
    try {
        console.log(`execSshCommand -- Trying to execute command: ${command.substring(0, 100)}`);
        const result = await connection.execCommand(command, { cwd: cwd });
        await connection.dispose();
        if (result.stderr) {
            console.error(`execSshCommand -- Failed to execute command: ${command.substring(0, 100)},Stderr:${result.stderr.substring(0, 100)}`);
        }
        if ((result.stdout || result.stdout === '') && !result.stderr) {
            console.log(`execSshCommand -- Succeeded to execute command: ${command.substring(0, 100)},Stdout:${result.stdout.substring(0, 100)}`);
        }
        return ({ stdout: result.stdout, stderr: result.stderr });
    } catch (ex) {
        await connection.dispose();
        const err = `execSshCommand -- Failed to execute command:${command.substring(0, 100)},Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};
