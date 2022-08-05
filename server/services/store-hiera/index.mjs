import express from 'express';
import router from './routes/store.route.js';
import { getDbConnection } from '../../lib/connection-db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const port = process.env.STORE_HIERA_PORT || 3002;

const origin = process.env.HOSTNAME === 'localhost' ? `http://${process.env.HOSTNAME}:3000` : `http://${process.env.HOSTNAME}`;
app.use(cors({ origin: origin, credentials: true }));
app.use(express.json({ limit: '200mb', extended: true }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
app.use(cookieParser());

app.use(router);

app.listen(port, async () => {
    try {
        console.log(`Store-Hiera-Service is up , on port : ${port}`);
        await getDbConnection();
    } catch (error) {
        console.error(`connection error ${JSON.stringify(error)}`);
        process.exit(1);
    }
});

export default app;
