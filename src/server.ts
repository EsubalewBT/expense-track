import express, {Request, Response} from 'express';
import dotenv from 'dotenv';
import {connectDB} from './index'
import passport from 'passport';
import { jwtStrategy } from "./config/passport";
const app = express();
import { config } from './config/config';
dotenv.config();
import { expenseRouter } from './route/expense.route';
import { authRouter } from './route/auth.route';
import { errorConverter, errorHandler } from './middleware/error';
connectDB();
app.use(express.json());
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);
app.use('/auth', authRouter);
app.use('/expense', expenseRouter);
app.use(errorConverter);
app.use(errorHandler);
app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});