// src/routes/books.ts
import { Hono } from 'hono';
import pool from '../db/mysql';
import { authMiddleware, pustakawanOnly, extractJWT } from '../middlewares/auth';
import { validateImage, saveFileWithTitle, replaceFile, deleteFile, createSlugFromTitle } from '../utils/upload';
import type { Book, BookRequest } from '../types';
import type { AppType } from '../types/hono';

const books = new Hono<AppType>();

/**
 * GET /books
 * Get all books (public access)
 */
books.get('/', async (c) => {
  try {
    const [rows] = await pool.query<Book[]>(
      `SELECT b.*, g.name as genre_name 
       FROM books b 
       INNER JOIN genres g ON b.genre_id = g.id 
       ORDER BY b.created_at DESC`
    );
    return c.json({ books: rows });
  } catch (error) {
    console.error('Get books error:', error);
    return c.json({ error: 'Failed to fetch books' }, 500);
  }
});

/**
 * GET /books/search?q=query
 * Search books by title, author, or synopsis (public access)
 */
books.get('/search', async (c) => {
  try {
    const query = c.req.query('q') || '';
    const genreId = c.req.query('genre') || '';
    
    let sql = `
      SELECT b.*, g.name as genre_name 
      FROM books b 
      INNER JOIN genres g ON b.genre_id = g.id 
      WHERE b.title LIKE ? OR b.author LIKE ? OR b.synopsis LIKE ?
    `;
    let params = [`%${query}%`, `%${query}%`, `%${query}%`];
    
    if (genreId) {
      sql += ' AND b.genre_id = ?';
      params.push(genreId);
    }
    
    sql += ' ORDER BY b.created_at DESC';
    
    const [rows] = await pool.query<Book[]>(sql, params);
    
    return c.json({ books: rows });
  } catch (error) {
    console.error('Search books error:', error);
    return c.json({ error: 'Failed to search books' }, 500);
  }
});

/**
 * GET /books/:slug
 * Get single book by SLUG (title with hyphens) - public access
 * Records viewing history for authenticated users
 */
books.get('/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    
    const [allBooks] = await pool.query<Book[]>(
      `SELECT b.*, g.name as genre_name 
       FROM books b 
       INNER JOIN genres g ON b.genre_id = g.id`
    );
    
    const targetBook = allBooks.find(book => {
      const bookSlug = createSlugFromTitle(book.title);
      return bookSlug === slug.toLowerCase();
    });
    
    if (!targetBook) {
      return c.json({ error: 'Book not found' }, 404);
    }
    
    // Record viewing history for authenticated users
    // Try to extract JWT from Authorization header (optional - doesn't fail if not present)
    const user = extractJWT(c);
    if (user && targetBook.id) {
      try {
        await pool.query(
          `INSERT INTO book_history (user_id, book_id, views, last_viewed) 
           VALUES (?, ?, 1, NOW()) 
           ON DUPLICATE KEY UPDATE views = views + 1, last_viewed = NOW()`,
          [user.id, targetBook.id]
        );
      } catch (historyError) {
        // Log but don't fail the request if history recording fails
        console.error('Failed to record book history:', historyError);
      }
    }
    
    return c.json({ book: targetBook });
  } catch (error) {
    console.error('Get book error:', error);
    return c.json({ error: 'Failed to fetch book' }, 500);
  }
});

/**
 * POST /books
 * Create new book (pustakawan only)
 */
books.post('/', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const formData = await c.req.formData();
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const genreId = formData.get('genreId') as string;
    const synopsis = formData.get('synopsis') as string;
    const coverImage = formData.get('coverImage') as File;
    
    if (!title || !author || !genreId || !synopsis) {
      return c.json({ error: 'All fields are required' }, 400);
    }
    
    let coverImageName = null;
    if (coverImage && coverImage.size > 0) {
      const validation = validateImage(coverImage);
      if (!validation.valid) {
        return c.json({ error: validation.error }, 400);
      }
      // Generate filename based on title
      coverImageName = await saveFileWithTitle(coverImage, title);
    }
    
    const [result] = await pool.query<any>(
      'INSERT INTO books (title, author, genre_id, synopsis, cover_img) VALUES (?, ?, ?, ?, ?)',
      [title, author, genreId, synopsis, coverImageName]
    );
    
    return c.json({
      message: 'Book created successfully',
      bookId: result.insertId,
      slug: createSlugFromTitle(title)
    }, 201);
    
  } catch (error) {
    console.error('Create book error:', error);
    return c.json({ error: 'Failed to create book' }, 500);
  }
});

/**
 * PUT /books/:id
 * Update book (pustakawan only)
 */
books.put('/:id', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const id = c.req.param('id');
    const formData = await c.req.formData();
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const genreId = formData.get('genreId') as string;
    const synopsis = formData.get('synopsis') as string;
    const coverImage = formData.get('coverImage') as File;
    
    if (!title || !author || !genreId || !synopsis) {
      return c.json({ error: 'All fields are required' }, 400);
    }
    
    // Get current book data
    const [currentBook] = await pool.query<Book[]>(
      'SELECT cover_img FROM books WHERE id = ?',
      [id]
    );
    
    if (currentBook.length === 0) {
      return c.json({ error: 'Book not found' }, 404);
    }
    
    let coverImageName = currentBook[0].cover_img;
    
    // Handle image update
    if (coverImage && coverImage.size > 0) {
      const validation = validateImage(coverImage);
      if (!validation.valid) {
        return c.json({ error: validation.error }, 400);
      }
      
      // Replace old image with new one
      coverImageName = await replaceFile(coverImageName, coverImage, title);
    }
    
    const [result] = await pool.query<any>(
      'UPDATE books SET title = ?, author = ?, genre_id = ?, synopsis = ?, cover_img = ? WHERE id = ?',
      [title, author, genreId, synopsis, coverImageName, id]
    );
    
    if (result.affectedRows === 0) {
      return c.json({ error: 'Book not found' }, 404);
    }
    
    return c.json({ 
      message: 'Book updated successfully',
      slug: createSlugFromTitle(title)
    });
    
  } catch (error) {
    console.error('Update book error:', error);
    return c.json({ error: 'Failed to update book' }, 500);
  }
});

/**
 * DELETE /books/:id
 * Delete book (pustakawan only)
 */
books.delete('/:id', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const id = c.req.param('id');
    
    // Get current book data for cover image deletion
    const [currentBook] = await pool.query<Book[]>(
      'SELECT cover_img FROM books WHERE id = ?',
      [id]
    );
    
    if (currentBook.length > 0 && currentBook[0].cover_img) {
      deleteFile(currentBook[0].cover_img);
    }
    
    const [result] = await pool.query<any>('DELETE FROM books WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return c.json({ error: 'Book not found' }, 404);
    }
    
    return c.json({ message: 'Book deleted successfully' });
    
  } catch (error) {
    console.error('Delete book error:', error);
    return c.json({ error: 'Failed to delete book' }, 500);
  }
});

export default books;