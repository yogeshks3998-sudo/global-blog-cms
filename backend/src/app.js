import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { USER_ROLES } from './constants/index.js';
import { env } from './config/env.js';
import { authorizeRoles, protect } from './middleware/authMiddleware.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import publicBlogRoutes from './routes/publicBlogRoutes.js';
import websiteRoutes from './routes/websiteRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const corsOptions = {
  origin: env.corsOrigin === '*' ? '*' : env.corsOrigin.split(',').map((origin) => origin.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-website-id']
};

app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(apiLimiter);

app.use('/uploads', express.static(path.resolve(__dirname, '../..', env.uploadDir)));

app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/admin/settings', protect, authorizeRoles(USER_ROLES.SUPER_ADMIN), profileRoutes);
app.use('/api/admin/websites', websiteRoutes);
app.use('/api/admin/clients', clientRoutes);
app.use('/api/client/profile', protect, authorizeRoles(USER_ROLES.CLIENT_ADMIN), profileRoutes);
app.use('/api/blogs', publicBlogRoutes);
app.use('/api/public/blogs', publicBlogRoutes);
app.use('/api', blogRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
