import validator from 'validator';
import { config } from './ssh-config.js';

const socketConfig = (socket) => {
socket.request.session.ssh = {
    host:
        config.ssh.host ||
        (validator.isIP(`${socket.handshake.query.host}`) && socket.handshake.query.host) ||
        (validator.isFQDN(socket.handshake.query.host) && socket.handshake.query.host) ||
        (/^(([a-z]|[A-Z]|\d|[!^(){}\-_~])+)?\w$/.test(socket.handshake.query.host) && socket.handshake.query.host),
    port: config.ssh.port,
    localAddress: config.ssh.localAddress,
    localPort: config.ssh.localPort,
    algorithms: config.algorithms,
    keepaliveInterval: config.ssh.keepaliveInterval,
    keepaliveCountMax: config.ssh.keepaliveCountMax,
    allowedSubnets: config.ssh.allowedSubnets,
    term: config.ssh.term,
    terminal: {
        cursorBlink: config.terminal.cursorBlink,
        scrollback: config.terminal.scrollback,
        tabStopWidth: config.terminal.tabStopWidth,
        bellStyle: config.terminal.bellStyle
    },
    allowreplay:
        config.options.challengeButton ||
        (validator.isBoolean(`${socket.request.headers.allowreplay}`)
            ? parseBool(socket.request.headers.allowreplay)
            : false),
    allowreauth: config.options.allowreauth || false,
    mrhsession:
        validator.isAlphanumeric(`${socket.request.headers.mrhsession}`) && socket.request.headers.mrhsession
            ? socket.request.headers.mrhsession
            : 'none',
    serverlog: {
        client: config.serverlog.client || false,
        server: config.serverlog.server || false
    },
    readyTimeout: config.ssh.readyTimeout
};
};
const parseBool = (str) => {
	return str.toLowerCase() === 'true';
};
export default socketConfig;
