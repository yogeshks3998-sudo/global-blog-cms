import fs from 'fs';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';

const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../..');
const uploadRoot = path.resolve(backendRoot, env.uploadDir);

fs.mkdirSync(uploadRoot, { recursive: true });
const imageStorage = process.env.IMAGE_STORAGE || 'database';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      const error = new Error('Only jpg, jpeg, png, and webp images are allowed');
      error.statusCode = 422;
      return cb(error);
    }

    return cb(null, true);
  }
});

export const uploadBlogImage = upload.single('featuredImage');

export const processBlogImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filename = `blog-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const processedImage = await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 1400, height: 788, fit: 'cover', position: 'center' })
      .webp({ quality: 78 })
      .toBuffer();

    if (imageStorage === 'filesystem') {
      const outputPath = path.join(uploadRoot, filename);
      await fs.promises.writeFile(outputPath, processedImage);
      req.file.path = path.join(env.uploadDir, filename).replace(/\\/g, '/');
      req.file.filename = filename;
      return next();
    }

    req.file.path = `data:image/webp;base64,${processedImage.toString('base64')}`;
    req.file.filename = filename;
    next();
  } catch (error) {
    next(error);
  }
};
