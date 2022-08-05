import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { getDbConnection } from '../../lib/connection-db.js';
import router from './routes/index.routes.js';

dotenv.config();
const app = express();

const port = process.env.ENTITIES_API_PORT || 3005;

const origin = process.env.HOSTNAME === 'localhost' ? `http://${process.env.HOSTNAME}:3000` : `http://${process.env.HOSTNAME}`;
app.use(cors({ origin: origin, credentials: true }));
app.use(express.json({ limit: '10mb', extended: true }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

app.use('/', router);

app.listen(port, async () => {
    try {
        console.log(`Source-Synce service is up: ${new Date().toLocaleString()}, on port : ${port}`);
        await getDbConnection();
    } catch (error) {
        console.error(`Error: ${JSON.stringify(error)}`);
        process.exit(1);
    }
});

export default app;
