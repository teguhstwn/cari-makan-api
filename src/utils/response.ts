import type { Response } from 'express';

export const successResponse = (res: Response, message: string, data: any = null, statusCode: number = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

export const errorResponse = (res: Response, message: string, statusCode: number = 500, error: any = null) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
    error: error ? error.message || error : null,
  });
};
