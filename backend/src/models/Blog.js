import mongoose from 'mongoose';
import slugify from 'slugify';
import { BLOG_STATUS } from '../constants/index.js';

const blogSchema = new mongoose.Schema(
  {
    websiteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      required: [true, 'Website ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    featuredImage: {
      type: String,
      default: null
    },
    authorName: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true
    },
    authorEmail: {
      type: String,
      required: [true, 'Author email is required'],
      lowercase: true,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    tags: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: Object.values(BLOG_STATUS),
      default: BLOG_STATUS.PENDING,
      index: true
    }
  },
  {
    timestamps: true
  }
);

blogSchema.index({ websiteId: 1, slug: 1 }, { unique: true });

blogSchema.pre('validate', async function createSlug(next) {
  if (!this.isModified('title') && this.slug) return next();

  const baseSlug = slugify(this.title, {
    lower: true,
    strict: true,
    trim: true
  });

  let candidateSlug = baseSlug;
  let suffix = 1;

  while (
    await this.constructor.exists({
      _id: { $ne: this._id },
      websiteId: this.websiteId,
      slug: candidateSlug
    })
  ) {
    candidateSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  this.slug = candidateSlug;
  next();
});

export const Blog = mongoose.model('Blog', blogSchema);
