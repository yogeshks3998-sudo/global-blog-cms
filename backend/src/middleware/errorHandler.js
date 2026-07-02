import mongoose from 'mongoose';
import multer from 'multer';
import { errorResponse } from '../utils/apiResponse.js';

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Server error';
  let errors = null;

  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 422;
    message = 'Validation error';
    errors = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message
    }));
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = 'Duplicate value already exists';
    errors = Object.keys(error.keyPattern || {}).map((field) => ({
      field,
      message: `${field} must be unique`
    }));
  }

  if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Invalid resource ID';
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Unauthorized';
  }

  if (error instanceof multer.MulterError) {
    statusCode = 422;
    message = error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5MB or smaller' : error.message;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(error);
  }

  return errorResponse(res, { statusCode, message, errors });
};
