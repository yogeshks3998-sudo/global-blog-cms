import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { Blog } from '../models/Blog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../..');

const mimeByExt = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
};

const normalizeUploadPath = (value) => {
  if (!value || /^data:image\//i.test(value)) return null;

  const normalized = value.replace(/\\/g, '/');
  const uploadIndex = normalized.indexOf('uploads/');

  if (uploadIndex === -1) return null;

  return normalized.slice(uploadIndex).replace(/^\/+/, '');
};

const resolveLocalFile = (uploadPath) => {
  const directPath = path.resolve(backendRoot, uploadPath);
  if (fs.existsSync(directPath)) return directPath;

  const fallbackPath = path.resolve(backendRoot, env.uploadDir, path.basename(uploadPath));
  if (fs.existsSync(fallbackPath)) return fallbackPath;

  return null;
};

await connectDB();

const blogs = await Blog.find({
  featuredImage: {
    $regex: '(uploads/|uploads\\\\|/uploads/)'
  }
}).select('_id title featuredImage');

let converted = 0;
let missing = 0;
let skipped = 0;

for (const blog of blogs) {
  const uploadPath = normalizeUploadPath(blog.featuredImage);

  if (!uploadPath) {
    skipped += 1;
    continue;
  }

  const filePath = resolveLocalFile(uploadPath);

  if (!filePath) {
    missing += 1;
    console.warn(`Missing file for blog "${blog.title}": ${blog.featuredImage}`);
    continue;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mimeByExt[ext] || 'application/octet-stream';
  const buffer = await fs.promises.readFile(filePath);
  const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

  await Blog.updateOne({ _id: blog._id }, { $set: { featuredImage: dataUrl } });
  converted += 1;
  console.log(`Converted blog image: ${blog.title}`);
}

console.log(
  `Image migration complete. Converted: ${converted}. Missing local files: ${missing}. Skipped: ${skipped}. Total matched: ${blogs.length}.`
);

await mongoose.disconnect();
