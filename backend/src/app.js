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
const backendRoot = path.resolve(__dirname, '..');
const uploadPublicRoot = path.resolve(backendRoot, env.uploadDir.split(/[\\/]/)[0] || 'uploads');
const uploadStorageRoot = path.resolve(backendRoot, env.uploadDir);

const app = express();
const configuredOrigins = env.corsOrigin
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (configuredOrigins.includes('*') || configuredOrigins.includes(origin)) return true;

  try {
    const { hostname, protocol } = new URL(origin);
    const isLocalNetwork =
      ['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname) ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

    const isSupportedPreviewHost =
      protocol === 'https:' && (hostname.endsWith('.vercel.app') || hostname.endsWith('.netlify.app'));

    return isSupportedPreviewHost || (protocol === 'http:' && isLocalNetwork);
  } catch {
    return false;
  }
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
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

app.use('/uploads', express.static(uploadPublicRoot));
app.use('/uploads', express.static(uploadStorageRoot));
app.use('/uploads', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Uploaded file not found'
  });
});

app.use('/', healthRoutes);
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
