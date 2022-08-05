import express from 'express';
import cron from 'node-cron';
import { getDbConnection } from '../../lib/connection-db.js';
import { startSync, startCache } from './job/index.js';
import CronJobTimers from './config/config.js';
import alerCollectRouter from './routes/alert-collect.route.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const port = process.env.ALERT_COLLECTOR_API_PORT || 3010;

const origin = process.env.HOSTNAME === 'localhost' ? `http://${process.env.HOSTNAME}:3000` : `http://${process.env.HOSTNAME}`;
app.use(cors({ origin: origin, credentials: true }));
app.use(express.json({ limit: '10mb', extended: true }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

app.use('/', alerCollectRouter);

app.listen(port, async () => {
    try {
        console.log(`Alert-Collector service is up: ${new Date().toLocaleString()}, on port : ${port}`);
        await getDbConnection();
        cron.schedule(CronJobTimers.ALERT_COLLECTOR, async () => {
            console.log(`Alert-Collector executed: ${new Date().toLocaleString()}`);
            await startSync();
        });
        // cache usage
        console.log(`Alert-Collector cache executed: ${new Date().toLocaleString()}`);
        await startCache();
    } catch (error) {
        console.error(`Error: ${JSON.stringify(error)}`);
        process.exit(1);
    }
});

export default app;
