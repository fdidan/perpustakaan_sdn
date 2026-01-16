// src/routes/users.ts
import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import pool from '../db/mysql';
import { authMiddleware, pustakawanOnly } from '../middlewares/auth';
import type { User } from '../types';

const users = new Hono();

/**
 * GET /users/history
 * Get current user's book viewing history (auth required)
 * IMPORTANT: Must be placed BEFORE /:id route to avoid routing conflicts
 */
users.get('/history', authMiddleware, async (c) => {
  try {
    const user = c.get('user') as any;

    // Fetch user's book history with book details
    const [history] = await pool.query<any[]>(
      `SELECT 
        bh.id,
        b.title,
        b.author,
        b.genre_id,
        g.name as genre_name,
        b.synopsis,
        b.cover_img,
        bh.views,
        bh.last_viewed
       FROM book_history bh
       INNER JOIN books b ON bh.book_id = b.id
       INNER JOIN genres g ON b.genre_id = g.id
       WHERE bh.user_id = ?
       ORDER BY bh.last_viewed DESC`,
      [user.id]
    );

    return c.json({
      message: 'Book history fetched successfully',
      bookHistory: history || []
    });

  } catch (error) {
    console.error('Get book history error:', error);
    return c.json({ error: 'Failed to fetch book history' }, 500);
  }
});

/**
 * GET /users/history/student/:studentId
 * Get specific student's book viewing history (pustakawan only)
 */
users.get('/history/student/:studentId', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const studentId = c.req.param('studentId');
    
    // Verify student exists
    const [studentCheck] = await pool.query<any[]>(
      'SELECT id, username, role FROM users WHERE id = ? AND role = "siswa"',
      [studentId]
    );
    
    if (studentCheck.length === 0) {
      return c.json({ error: 'Student not found' }, 404);
    }
    
    const student = studentCheck[0];
    
    // Fetch student's book history with book details
    const [history] = await pool.query<any[]>(
      `SELECT 
        bh.id,
        b.id as book_id,
        b.title,
        b.author,
        b.genre_id,
        g.name as genre_name,
        b.synopsis,
        b.cover_img,
        bh.views,
        bh.last_viewed
       FROM book_history bh
       INNER JOIN books b ON bh.book_id = b.id
       INNER JOIN genres g ON b.genre_id = g.id
       WHERE bh.user_id = ?
       ORDER BY bh.last_viewed DESC`,
      [studentId]
    );

    return c.json({
      message: 'Student history fetched successfully',
      student: {
        id: student.id,
        username: student.username,
        role: student.role
      },
      bookHistory: history || []
    });

  } catch (error) {
    console.error('Get student history error:', error);
    return c.json({ error: 'Failed to fetch student history' }, 500);
  }
});

/**
 * GET /users/list/students
 * Get all students with their reading statistics (pustakawan only)
 */
users.get('/list/students', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const [students] = await pool.query<any[]>(
      `SELECT 
        u.id,
        u.username,
        u.role,
        u.created_at,
        COUNT(DISTINCT bh.book_id) as total_books_read,
        SUM(bh.views) as total_views
       FROM users u
       LEFT JOIN book_history bh ON u.id = bh.user_id
       WHERE u.role = 'siswa'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    
    return c.json({ 
      message: 'Students list fetched successfully',
      students 
    });
  } catch (error) {
    console.error('Get students error:', error);
    return c.json({ error: 'Failed to fetch students' }, 500);
  }
});

/**
 * GET /users
 * Get all users (pustakawan only)
 */
users.get('/', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const [rows] = await pool.query<User[]>(
      'SELECT id, username, role, created_at FROM users ORDER BY created_at DESC'
    );
    
    // Don't send password hash
    const safeUsers = rows.map(({ password, ...user }) => user);
    
    return c.json({ users: safeUsers });
  } catch (error) {
    console.error('Get users error:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

/**
 * GET /users/:id
 * Get single user by ID (pustakawan only)
 */
users.get('/:id', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const id = c.req.param('id');
    const [rows] = await pool.query<User[]>(
      'SELECT id, username, role, created_at FROM users WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({ user: rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

/**
 * POST /users
 * Create new user (pustakawan only)
 */
users.post('/', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const { username, password, role = 'siswa' } = await c.req.json();
    
    if (!username || !password) {
      return c.json({ error: 'Username and password are required' }, 400);
    }
    
    if (!['siswa', 'pustakawan'].includes(role)) {
      return c.json({ error: 'Invalid role. Must be either "siswa" or "pustakawan"' }, 400);
    }
    
    // Check if username already exists
    const [existing] = await pool.query<User[]>(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    
    if (existing.length > 0) {
      return c.json({ error: 'Username already exists' }, 409);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await pool.query<any>(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role]
    );
    
    return c.json({
      message: 'User created successfully',
      userId: result.insertId
    }, 201);
    
  } catch (error) {
    console.error('Create user error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

/**
 * PUT /users/:id
 * Update user (pustakawan only)
 */
users.put('/:id', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const id = c.req.param('id');
    const { username, password, role } = await c.req.json();
    
    // Verify user exists
    const [existing] = await pool.query<User[]>(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Check if new username already exists (if username is being changed)
    if (username) {
      const [duplicates] = await pool.query<User[]>(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, id]
      );
      
      if (duplicates.length > 0) {
        return c.json({ error: 'Username already exists' }, 409);
      }
    }
    
    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    
    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    
    if (password) {
      updates.push('password = ?');
      values.push(await bcrypt.hash(password, 10));
    }
    
    if (role) {
      if (!['siswa', 'pustakawan'].includes(role)) {
        return c.json({ error: 'Invalid role. Must be either "siswa" or "pustakawan"' }, 400);
      }
      updates.push('role = ?');
      values.push(role);
    }
    
    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }
    
    // Add id to values array
    values.push(id);
    
    // Update user
    const [result] = await pool.query<any>(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    if (result.affectedRows === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({ message: 'User updated successfully' });
    
  } catch (error) {
    console.error('Update user error:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

/**
 * DELETE /users/:id
 * Delete user (pustakawan only)
 */
users.delete('/:id', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const id = c.req.param('id');
    
    const [result] = await pool.query<any>(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({ message: 'User deleted successfully' });
    
  } catch (error) {
    console.error('Delete user error:', error);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

export default users;