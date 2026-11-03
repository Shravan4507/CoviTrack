import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthTokenPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  // Check HTTP-only cookie first, then fallback to Authorization header
  const token = req.cookies?.covitrack_token || req.headers.authorization?.replace(/^Bearer\s+/, '');

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. No session token provided.',
    });
    return;
  }

  const payload = AuthService.verifyToken(token);
  if (!payload) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired session. Please log in again.',
    });
    return;
  }

  req.user = payload;
  next();
};

