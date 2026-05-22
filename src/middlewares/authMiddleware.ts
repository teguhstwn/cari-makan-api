import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Unauthorized: Missing or invalid token format', 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return errorResponse(res, 'Unauthorized: Missing token', 401);
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return errorResponse(res, 'Internal Server Error: JWT secret is not configured', 500);
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return errorResponse(res, 'Forbidden: Invalid or expired token', 403, err);
    }

    const payload = decoded as { id: string; username: string };
    req.user = {
      id: payload.id,
      username: payload.username,
    };

    next();
  });
};
