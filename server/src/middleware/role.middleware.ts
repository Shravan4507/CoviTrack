import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access forbidden: Insufficient permissions for role '${req.user.role}'. Required: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};

