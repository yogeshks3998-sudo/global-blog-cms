import fs from 'fs';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';
import { env } from '../config/env.js';

const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const uploadRoot = path.resolve(env.uploadDir);

fs.mkdirSync(uploadRoot, { recursive: true });

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
    const outputPath = path.join(uploadRoot, filename);

    await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outputPath);

    req.file.path = path.join(env.uploadDir, filename).replace(/\\/g, '/');
    req.file.filename = filename;
    next();
  } catch (error) {
    next(error);
  }
};
