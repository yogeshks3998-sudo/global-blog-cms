import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { ACCOUNT_STATUS, USER_ROLES } from '../constants/index.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true
    },
    websiteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      default: null,
      index: true,
      required: function requireWebsiteForClient() {
        return this.role === USER_ROLES.CLIENT_ADMIN;
      }
    },
    status: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.ACTIVE
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('validate', function validateTenantRole(next) {
  if (this.role === USER_ROLES.SUPER_ADMIN) {
    this.websiteId = null;
  }

  next();
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
