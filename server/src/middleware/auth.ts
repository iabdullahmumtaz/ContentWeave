import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET || 'dev-only-change-in-production');
    req.userId = String(payload.sub);
    req.userRole = (payload as jwt.JwtPayload & { role?: string }).role;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
