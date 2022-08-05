import express from 'express';
import cron from 'node-cron';
import { getDbConnection } from '../../lib/connection-db.js';
import { startSync } from './job/index.js';
import CronJobTimers from './config/config.js';
import statusCheckRouter from './routes/status-check.route.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const port = process.env.STATUS_CHECK_API_PORT || 3006;

const origin = process.env.HOSTNAME === 'localhost' ? `http://${process.env.HOSTNAME}:3000` : `http://${process.env.HOSTNAME}`;
app.use(cors({ origin: origin, credentials: true }));
app.use(express.json({ limit: '10mb', extended: true }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

app.use('/', statusCheckRouter);

app.listen(port, async () => {
    try {
        console.log(`Status-Check service is up: ${new Date().toLocaleString()}, on port : ${port}`);
        await getDbConnection();
        cron.schedule(CronJobTimers.STATUS_CHECK, async () => {
            console.log(`Status-Check executed: ${new Date().toLocaleString()}`);
            startSync();
        });
    } catch (error) {
        console.error(`Error: ${JSON.stringify(error)}`);
        process.exit(1);
    }
});

export default app;
