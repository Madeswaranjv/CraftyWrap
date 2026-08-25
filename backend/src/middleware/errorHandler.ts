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

  if ((error as { type?: string }).type === 'entity.too.large' || (error as { status?: number }).status === 413) {
    sendError(res, 413, 'Upload payload too large. Please upload smaller image files or fewer photos.');
    return;
  }

  if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: number }).code === 11000) {
    const keyValue = (error as { keyValue?: Record<string, string> }).keyValue;
    const field = keyValue ? Object.keys(keyValue)[0] : 'field';
    const val = keyValue ? keyValue[field] : '';
    if (field === 'email') {
      sendError(res, 409, 'This email is already registered.');
    } else {
      sendError(res, 409, `A product or record with this ${field} ("${val}") already exists.`);
    }
    return;
  }

  if (error instanceof Error && error.name === 'ValidationError') {
    sendError(res, 400, 'Database validation failed.', error);
    return;
  }

  console.error('Unhandled server error:', error);
  sendError(res, 500, error instanceof Error ? error.message : 'Unexpected server error occurred.');
};
