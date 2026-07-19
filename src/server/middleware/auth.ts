import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from "express";
import { EFFECTIVE_JWT_SECRET } from '../config';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; name?: string; [key: string]: unknown };
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET as string);
    req.user = decoded as Record<string, unknown>;
    next();
  } catch (error: unknown) {
    return res.status(401).json({ error: 'unauthorized' });
  }
};

export const requireCsrf = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    const csrfCookie = req.cookies.csrf_token;
    const csrfHeader = req.headers['x-csrf-token'];
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return res.status(403).json({ error: 'csrf_failed' });
    }
  }
  next();
};
