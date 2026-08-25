import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { sendError } from '../utils/apiResponse';

export function validateBody(schema: ZodType): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issueDetails = result.error.issues
        .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
        .join('; ');
      sendError(
        res,
        400,
        `Request validation failed: ${issueDetails}`,
        result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
      );
      return;
    }
    req.body = result.data;
    next();
  };
}
