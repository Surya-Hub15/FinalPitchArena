import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'pitcharena-jwt-super-secret-key-2026';
const JWT_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: 'STUDENT' | 'JUDGE' | 'ADMIN';
  status: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export function generateAccessToken(user: AuthenticatedUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function generateRefreshToken(user: AuthenticatedUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.find('users', u => u.id === decoded.id);

    if (!user) {
      res.status(401).json({ success: false, error: 'User account not found.' });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({ success: false, error: 'Account suspended. Contact platform administrator.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    };
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ success: false, error: 'Token expired. Please refresh session.', code: 'TOKEN_EXPIRED' });
      return;
    }
    res.status(401).json({ success: false, error: 'Invalid or forged authentication token.' });
  }
}

export function authorizeRole(allowedRoles: Array<'STUDENT' | 'JUDGE' | 'ADMIN'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Record failed unauthorized access in audit logs
      db.insert('audit_logs', {
        actor_id: req.user.id,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        target_entity: req.path,
        target_id: 0,
        ip_address: req.ip || '127.0.0.1',
        user_agent: req.headers['user-agent'] || '',
        metadata: { attempted_role: req.user.role, required_roles: allowedRoles }
      });

      res.status(403).json({
        success: false,
        error: `Forbidden: Access restricted to [${allowedRoles.join(', ')}]. Your role is ${req.user.role}.`
      });
      return;
    }

    next();
  };
}
