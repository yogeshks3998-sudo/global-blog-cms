import mongoose from 'mongoose';
import { ACCOUNT_STATUS } from '../constants/index.js';
import { generateApiKey } from '../utils/generateApiKey.js';

const websiteSchema = new mongoose.Schema(
  {
    websiteName: {
      type: String,
      required: [true, 'Website name is required'],
      trim: true
    },
    websiteUrl: {
      type: String,
      required: [true, 'Website URL is required'],
      trim: true
    },
    apiKey: {
      type: String,
      unique: true,
      default: generateApiKey,
      index: true
    },
    logo: {
      type: String,
      default: null
    },
    clientAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client admin is required'],
      unique: true,
      index: true
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

export const Website = mongoose.model('Website', websiteSchema);
