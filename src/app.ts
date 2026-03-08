import compression from 'compression';
import cors from 'cors';
import express from 'express';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import passport from 'passport';
import xss from 'xss';

import { config } from './config/config';
import { jwtStrategy } from './config/passport';
import { errorConverter, errorHandler } from './middleware/error';
import { authRouter } from './route/auth.route';
import { docsRouter } from './route/docs.route';
import { expenseRouter } from './route/expense.route';

const app = express();

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

const sanitizeXss = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return xss(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeXss(item));
  }

  if (value && typeof value === 'object') {
    Object.keys(value as Record<string, unknown>).forEach((key) => {
      (value as Record<string, unknown>)[key] = sanitizeXss(
        (value as Record<string, unknown>)[key],
      );
    });
  }

  return value;
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
app.use((req, _res, next) => {
  // Express 5 exposes `req.query` as a getter-only property.
  // Sanitize payloads in place to avoid reassigning `req.query`.
  if (req.body) {
    mongoSanitize.sanitize(req.body);
  }

  if (req.params) {
    mongoSanitize.sanitize(req.params);
  }

  if (req.query) {
    mongoSanitize.sanitize(req.query as Record<string, unknown>);
  }

  next();
});
app.use((req, _res, next) => {
  sanitizeXss(req.body);
  sanitizeXss(req.params);
  sanitizeXss(req.query);
  next();
});
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

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/expense', apiLimiter, expenseRouter);
app.use('/api/docs', docsRouter);
app.use(errorConverter);
app.use(errorHandler);

export default app;
