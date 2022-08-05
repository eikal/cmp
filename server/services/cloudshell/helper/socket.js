import fs from 'fs';
import ssh from './ssh.js';
import socketConfig from '../config/socket-config.js';
import { getSshKeyByCloudspaceID } from '../../entities-api/helpers/configuration.js';

// executed when new 'connection' event generated by new socket from client
const socketConnection = (socket) => {
  socketConfig(socket);
  setupSocket(socket);
};

const setupSocket = async (socket) => {
  try {
    // if socket connection arrives without an express session, kill it
    if (!socket.request.session) {
      socket.emit('401 UNAUTHORIZED');
      console.error(`setupSocket - SOCKET:${socket?.id} No Express Session / REJECTED`);
      socket.disconnect(true);
      return;
    }
    console.log(`setupSocket - trying to setup new socket connection with SOCKET_ID: ${socket?.id} on HOST:${socket.request._query.host} with USER:${socket.request._query.username} `);
    const sshKeyExist = await getSshKeyByCloudspaceID(socket.handshake.query.cloudspaceID);
    const sshKeyObject = {
      username: sshKeyExist?.username || process.env.CMP_ROOT_USER,
      keyPath: sshKeyExist?.keyPath || process.env.CMP_ROOT_KEY,
      keyPass: sshKeyExist?.keyPass || null
    };
    if (sshKeyObject.username && sshKeyObject.keyPath && socket.handshake.query.host) {
      const sshConn = ssh(socket, sshKeyObject.username);
      socket.request.session.ssh.privateKey = fs.readFileSync(sshKeyObject.keyPath, 'utf-8');
      socket.request.session.ssh.username = sshKeyObject.username;
      socket.request.session.ssh.tryKeyboard = true;
      sshConn.connect(socket.request.session.ssh);
    } else {
      console.log(`setupSocket - Attempt to connect without session privateKey/username/password or session varialbles defined, potentially previously abandoned client session. disconnecting websocket client.\r\nHandshake information: \r\n  ${JSON.stringify(socket.handshake)}`);
      socket.emit('ssherror', 'WEBSOCKET ERROR - Refresh the browser and try again');
      socket.request.session.destroy();
      socket.disconnect(true);
    }
  } catch (ex) {
    console.error(`setupSocket -- Error while trying setup socket ${socket.id} for HOST: ${socket.handshake.query.host}, USER: ${socket.handshake.query.username}, Error: ${JSON.stringify(ex.message)}`);
    socket.request.session.destroy();
    socket.disconnect(true);
  }
};

export default socketConnection;
