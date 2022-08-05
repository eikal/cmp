import express from 'express';
import { getDbConnection } from '../../lib/connection-db.js';
import authRouter from './routes/auth.route.js';
import roleRouter from './routes/role.route.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();
const app = express();

const port = process.env.AUTH_PORT || 3001;

const origin = process.env.HOSTNAME === 'localhost' ? `http://${process.env.HOSTNAME}:3000` : `http://${process.env.HOSTNAME}`;
app.use(cors({ origin: origin, credentials: true }));
app.use(express.json({ limit: '10mb', extended: true }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

app.use('/', authRouter);
app.use('/role', roleRouter);

app.listen(port, async function () {
	try {
		await getDbConnection();
		console.log(`Auth-Service is up , on port : ${port}`);
	} catch (error) {
		console.error(`connection error ${JSON.stringify(error)}`);
		process.exit(1);
	}
});

export default app;
