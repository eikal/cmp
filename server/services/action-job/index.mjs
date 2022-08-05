import express from 'express';
import { actionJobRouter, actionJobConfigRouter } from './routes/index.js';
import cors from 'cors';
import { getDbConnection } from '../../lib/connection-db.js';
import { cleanAllInProgressActions } from './helpers/helpers.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const port = process.env.ACTION_JOB_PORT || 3008;

const origin = process.env.HOSTNAME === 'localhost' ? `http://${process.env.HOSTNAME}:3000` : `http://${process.env.HOSTNAME}`;
app.use(cors({ origin: origin, credentials: true }));
app.use(express.json({ limit: '10mb', extended: true }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

app.use('/', actionJobRouter);
app.use('/config', actionJobConfigRouter);

app.listen(port, async () => {
    try {
        console.log(`Action-Job-Service is up , on port : ${port}`);
        await getDbConnection();
        await cleanAllInProgressActions();
    } catch (error) {
        console.error(`connection error ${JSON.stringify(error)}`);
        process.exit(1);
    }
});

process.on('uncaughtException', function (err) {
    if (err === 'ECONNRESET') {
        console.error(err.stack);
    }
    process.exit();
});

export default app;
