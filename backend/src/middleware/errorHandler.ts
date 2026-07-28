import type { ErrorRequestHandler, RequestHandler } from 'express';
import { HttpError } from '../utils/HttpError';
import { sendError } from '../utils/apiResponse';

export const notFound: RequestHandler = (req, res) => {
  sendError(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    sendError(res, error.statusCode, error.message, error.errors);
    return;
  }

  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
    sendError(res, 409, 'This email is already registered.');
    return;
  }

  if (error instanceof Error && error.name === 'ValidationError') {
    sendError(res, 400, 'Database validation failed.', error);
    return;
  }

  console.error(error);
  sendError(res, 500, 'Unexpected server error.');
};
