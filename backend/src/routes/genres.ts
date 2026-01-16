import { Hono } from 'hono';
import db from '../db/mysql';
import { authMiddleware, pustakawanOnly } from '../middlewares/auth';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { Genre } from '../types';
import type { AppType } from '../types/hono';

const genres = new Hono<AppType>();

// Get all genres
genres.get('/', async (c) => {
  try {
    const [rows] = await db.query<Genre[]>('SELECT * FROM genres ORDER BY name');
    return c.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching genres:', error);
    return c.json({ success: false, message: 'Failed to fetch genres' }, 500);
  }
});

// Add new genre (pustakawan only)
genres.post('/', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const { name } = await c.req.json();
    if (!name) {
      return c.json({ success: false, message: 'Genre name is required' }, 400);
    }

    const [result] = await db.query<ResultSetHeader>(
      'INSERT INTO genres (name) VALUES (?)',
      [name]
    );

    return c.json({ 
      success: true, 
      message: 'Genre added successfully',
      data: { id: result.insertId, name }
    }, 201);
  } catch (error) {
    console.error('Error adding genre:', error);
    return c.json({ success: false, message: 'Failed to add genre' }, 500);
  }
});

// Update genre (pustakawan only)
genres.put('/:id', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const id = c.req.param('id');
    const { name } = await c.req.json();
    
    if (!name) {
      return c.json({ success: false, message: 'Genre name is required' }, 400);
    }

    const [result] = await db.query<ResultSetHeader>(
      'UPDATE genres SET name = ? WHERE id = ?',
      [name, id]
    );

    if (result.affectedRows === 0) {
      return c.json({ success: false, message: 'Genre not found' }, 404);
    }

    return c.json({ 
      success: true, 
      message: 'Genre updated successfully',
      data: { id, name }
    });
  } catch (error) {
    console.error('Error updating genre:', error);
    return c.json({ success: false, message: 'Failed to update genre' }, 500);
  }
});

// Delete genre (pustakawan only)
genres.delete('/:id', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const id = c.req.param('id');
    
    // Check if genre is being used by any books
    const [books] = await db.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM books WHERE genre_id = ?',
      [id]
    );

    if (books[0]?.count > 0) {
      return c.json({ 
        success: false, 
        message: 'Cannot delete genre that is being used by books' 
      }, 400);
    }

    const [result] = await db.query<ResultSetHeader>(
      'DELETE FROM genres WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return c.json({ success: false, message: 'Genre not found' }, 404);
    }

    return c.json({ 
      success: true, 
      message: 'Genre deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting genre:', error);
    return c.json({ success: false, message: 'Failed to delete genre' }, 500);
  }
});

export default genres;
