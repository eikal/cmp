import express from 'express';
import k8sRouter from './routes/k8s.route.js';
import cors from 'cors';
import { getDbConnection } from '../../lib/connection-db.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const port = process.env.ACTION_JOB_PORT || 3009;

const origin = process.env.HOSTNAME === 'localhost' ? `http://${process.env.HOSTNAME}:3000` : `http://${process.env.HOSTNAME}`;
app.use(cors({ origin: origin, credentials: true }));
app.use(express.json({ limit: '10mb', extended: true }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

app.use('/', k8sRouter);

app.listen(port, async () => {
    try {
        console.log(`K8S-Service is up , on port : ${port}`);
        await getDbConnection();
    } catch (error) {
        console.error(`connection error ${JSON.stringify(error)}`);
        process.exit(1);
    }
});

export default app;
