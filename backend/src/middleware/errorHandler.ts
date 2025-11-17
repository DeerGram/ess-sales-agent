import type { NextFunction, Request, Response } from 'express';

export class HttpError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export const errorHandler = (err: Error | HttpError, _req: Request, res: Response, _next: NextFunction) => {
  const status = err instanceof HttpError ? err.status : 500;
  const payload = {
    error: {
      message: status === 500 ? 'Internal server error' : err.message,
      status,
    },
  };

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json(payload);
};
