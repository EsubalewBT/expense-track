import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import passport from 'passport';
import xss from 'xss-clean';

import { config } from './config/config';
import { jwtStrategy } from './config/passport';
import { connectDB } from './index';
import { errorConverter, errorHandler } from './middleware/error';
import { authRouter } from './route/auth.route';
import { expenseRouter } from './route/expense.route';

const app = express();

dotenv.config();
connectDB();

app.set('trust proxy', 1);

const corsOptions: cors.CorsOptions = {
    origin(origin, callback) {
        if (!origin) {
            callback(null, true);
            return;
        }

        if (config.env !== 'production' || config.corsOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
};

app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(hpp());
app.use(mongoSanitize());
app.use(xss());
app.use(compression());

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.env === 'production' ? 20 : 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        code: 429,
        message: 'Too many authentication attempts, please try again later.',
    },
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.env === 'production' ? 300 : 2000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        code: 429,
        message: 'Too many requests, please try again later.',
    },
});

app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

app.use('/auth', authLimiter, authRouter);
app.use('/expense', apiLimiter, expenseRouter);

app.use(errorConverter);
app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});