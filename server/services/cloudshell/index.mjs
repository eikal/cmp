import express from 'express';
import sessions from 'express-session';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/ssh-config.js';
import { Server } from 'socket.io';
import socketConnection from './helper/socket.js';
import { getDbConnection } from '../../lib/connection-db.js';
import dotenv from 'dotenv';

dotenv.config();

let connectionCount = 0;

const app = express();
const origin = process.env.HOSTNAME === 'localhost' ? `http://${process.env.HOSTNAME}:3000` : `http://${process.env.HOSTNAME}`;
app.use(cors({ origin: origin, credentials: true }));

const port = config.listen.port;
const server = app.listen(port, async () => {
	try {
		console.log(`cloudshell-service is up , on port : ${port}`);
		await getDbConnection();
	} catch (error) {
		console.error(`connection error ${JSON.stringify(error)}`);
		process.exit(1);
	}
});
const io = new Server(server, {
	cors: {
		origin: origin,
		methods: ['GET', 'POST']
	}
});
const session = sessions({
	secret: config.session.secret,
	name: config.session.name,
	saveUninitialized: false,
	resave: true,
	unset: 'destroy'
});

// express setting
app.use(session);
app.use(express.json({ limit: '10mb', extended: true }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

io.use((socket, next) => {
	socket.request.res ? session(socket.request, socket.request.res, next) : next(next);
});

io.on('connection', socketConnection);

io.on('connection', (socket) => {
	connectionCount = connectionCount + 1;
	socket.on('disconnect', () => {
		connectionCount = connectionCount - 1;
	});
	socket.on('geometry', (cols, rows) => {
		socket.request.session.ssh.terminfo = { cols, rows };
	});
});

// clean stop server and socket
const stopApp = (reason) => {
	if (reason) {
		console.log(`stopApp -- Stopping: ${reason}`);
	}
	io.close();
	server.close();
	process.exit(1);
};

const signals = ['SIGTERM', 'SIGINT'];
signals.forEach((signal) =>
	process.on(signal, () => {
		console.error(`${signal} -- Trying close all connections :${connectionCount} while close cloudshell service`);
		stopApp('All connections ended');
	})
);
