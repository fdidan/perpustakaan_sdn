// src/middleware/auth.ts
import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import type { JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

/**
 * Extract and verify JWT token from Authorization header
 * Returns decoded payload if valid, null if no token or invalid
 */
export function extractJWT(c: Context): JWTPayload | null {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verify JWT token and attach user info to context
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }
}

/**
 * Check if user has pustakawan role
 */
export async function pustakawanOnly(c: Context, next: Next) {
  const user = c.get('user') as JWTPayload;
  
  if (!user || user.role !== 'pustakawan') {
    return c.json({ error: 'Forbidden - Pustakawan access only' }, 403);
  }
  
  await next();
}