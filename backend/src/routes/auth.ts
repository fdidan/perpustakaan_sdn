// src/routes/auth.ts
import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/mysql';
import type { User, LoginRequest, JWTPayload } from '../types';

const auth = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || '09e08625f9b2963ffc92daf546201d76fe2ab33cf2f64a526caabd6238491ba9';

/**
 * POST /auth/login
 * Login user and return JWT token
 */
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json<LoginRequest>();
    const { username, password } = body;
    
    if (!username || !password) {
      return c.json({ error: 'Username and password are required' }, 400);
    }
    
    // Find user by username
    const [rows] = await pool.query<User[]>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    ) as [User[], any];
    
    if (rows.length === 0) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    const user = rows[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Generate JWT token
    const payload: JWTPayload = {
      id: user.id,
      role: user.role
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    
    return c.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * POST /auth/register (optional - for testing)
 */
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json<LoginRequest & { role: 'siswa' | 'pustakawan' }>();
    const { username, password, role = 'siswa' } = body;
    
    if (!username || !password) {
      return c.json({ error: 'Username and password are required' }, 400);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    await pool.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role]
    );
    
    return c.json({ message: 'User registered successfully' }, 201);
    
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return c.json({ error: 'Username already exists' }, 409);
    }
    console.error('Register error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * POST /auth/logout
 * Logout user (invalidate token)
 */
auth.post('/logout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No token provided' }, 401);
    }
    
    const token = authHeader.substring(7);
    
    try {
      // Verify token is valid
      jwt.verify(token, JWT_SECRET);
      
      // In a more complete implementation, you might want to:
      // 1. Add the token to a blacklist
      // 2. Store blacklisted tokens in Redis/database
      // 3. Clear any session data
      
      return c.json({ 
        message: 'Logout successful',
        success: true 
      });
      
    } catch (error) {
      return c.json({ error: 'Invalid token' }, 401);
    }
    
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default auth;