import express from 'express';
import monitoringRouter from './routes/monitoring.route.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const port = process.env.MONITORING_API_PORT || 3007;

const origin = process.env.HOSTNAME === 'localhost' ? `http://${process.env.HOSTNAME}:3000` : `http://${process.env.HOSTNAME}`;
app.use(cors({ origin: origin, credentials: true }));
app.use(express.json({ limit: '10mb', extended: true }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

app.use('/', monitoringRouter);

app.listen(port, async () => {
    try {
        console.log(`Monitoring-Service is up , on port : ${port}`);
    } catch (error) {
        console.error(`connection error ${JSON.stringify(error)}`);
        process.exit(1);
    }
});

export default app;
