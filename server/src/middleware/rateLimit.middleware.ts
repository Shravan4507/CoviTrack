import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const attempts = new Map<string, RateLimitRecord>();

export const authRateLimiter = (maxAttempts = 15, windowMinutes = 15) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    const record = attempts.get(ip);
    if (!record || now > record.resetTime) {
      attempts.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (record.count >= maxAttempts) {
      res.status(429).json({
        success: false,
        error: `Too many requests from this IP. Please try again after ${Math.ceil((record.resetTime - now) / 60000)} minutes.`,
      });
      return;
    }

    record.count++;
    next();
  };
};

