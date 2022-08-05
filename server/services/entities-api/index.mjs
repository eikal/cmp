import express from 'express';
import {
    factRouter,
    cloudspaceRouter,
    projectRouter,
    tierRouter,
    serverRouter,
    configRouter,
    foremanRouter,
    tenantRouter,
    storyBookRouter
} from './routes/index.js';
import { getDbConnection } from '../../lib/connection-db.js';
import { insertDefaultDocuments } from './services/db-default.service.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const port = process.env.ENTITIES_API_PORT || 3003;

const origin = process.env.HOSTNAME === 'localhost' ? `http://${process.env.HOSTNAME}:3000` : `http://${process.env.HOSTNAME}`;
app.use(cors({ origin: origin, credentials: true }));
app.use(express.json({ limit: '10mb', extended: true }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

app.use('/facts', factRouter);
app.use('/cloudspace', cloudspaceRouter);
app.use('/project', projectRouter);
app.use('/tier', tierRouter);
app.use('/server', serverRouter);
app.use('/config', configRouter);
app.use('/foreman', foremanRouter);
app.use('/tenant', tenantRouter);
app.use('/story-book', storyBookRouter);

app.listen(port, async () => {
    try {
        console.log(`Entities-API-Service is up , on port : ${port}`);
        await getDbConnection();
        await insertDefaultDocuments();
    } catch (error) {
        console.error(`connection error ${JSON.stringify(error)}`);
        process.exit(1);
    }
});

export default app;
