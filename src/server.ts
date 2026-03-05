import express, {Request, Response} from 'express';
import dotenv from 'dotenv';
import {connectDB} from './index'
const app = express();
import { config } from './config/config';
dotenv.config();
import { expenseRouter } from './route/expense.route';
connectDB();
app.use(express.json());
app.use('/expense', expenseRouter);
app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});