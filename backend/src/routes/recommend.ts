// src/routes/recommend.ts
import { Hono } from 'hono';
import pool from '../db/mysql';
import { authMiddleware } from '../middlewares/auth';
import { getRecommendations, getRecommendationsByTitle, getPersonalizedRecommendations } from '../services/recommendation';
import type { Book, JWTPayload } from '../types';
import type { AppType } from '../types/hono';

const recommend = new Hono<AppType>();

/**
 * GET /recommend?title=book_title
 * Get recommendations by book title (public access)
 */
recommend.get('/', async (c) => {
  try {
    const title = c.req.query('title');
    
    if (!title) {
      return c.json({ error: 'Title parameter is required' }, 400);
    }
    
    // Fetch all books from database WITH GENRE NAME
    const [books] = await pool.query<Book[]>(
      `SELECT b.*, g.name as genre_name 
       FROM books b 
       INNER JOIN genres g ON b.genre_id = g.id`
    );
    
    if (books.length === 0) {
      return c.json({ error: 'No books available' }, 404);
    }
    
    // Get recommendations
    const recommendations = getRecommendationsByTitle(title, books, 10);
    
    if (recommendations.length === 0) {
      return c.json({ 
        message: 'No similar books found',
        recommendations: [] 
      });
    }
    
    // Find the target book
    const targetBook = books.find(book => 
      book.title.toLowerCase().includes(title.toLowerCase())
    );
    
    return c.json({
      targetBook,
      recommendations
    });
    
  } catch (error) {
    console.error('Recommendation error:', error);
    return c.json({ error: 'Failed to get recommendations' }, 500);
  }
});

/**
 * GET /recommend/me
 * Get personalized recommendations for authenticated user based on viewing history
 * Returns 10-20 recommendations weighted by user's genre preferences and global popularity
 */
recommend.get('/me', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    
    // Fetch user's viewing history with genre information
    const [userHistory] = await pool.query<any[]>(
      `SELECT bh.book_id, bh.views, b.genre_id, g.name as genre_name, b.created_at
       FROM book_history bh
       INNER JOIN books b ON bh.book_id = b.id
       INNER JOIN genres g ON b.genre_id = g.id
       WHERE bh.user_id = ?
       ORDER BY bh.views DESC`,
      [user.id]
    );
    
    // If user has no history, return popular books
    if (userHistory.length === 0) {
      const [allBooks] = await pool.query<Book[]>(
        `SELECT b.*, g.name as genre_name, COUNT(bh.id) as view_count
         FROM books b
         INNER JOIN genres g ON b.genre_id = g.id
         LEFT JOIN book_history bh ON b.id = bh.book_id
         GROUP BY b.id
         ORDER BY view_count DESC, b.created_at DESC
         LIMIT 20`
      );
      
      return c.json({
        message: 'No viewing history. Returning popular books.',
        recommendations: allBooks.map(book => ({
          ...book,
          similarity: (book.view_count || 0) / 100 // Normalize as similarity score
        }))
      });
    }
    
    // Build genre preference map from user's history
    const userGenrePrefs = new Map<string, number>();
    userHistory.forEach(entry => {
      const genreName = entry.genre_name.toLowerCase();
      const currentCount = userGenrePrefs.get(genreName) || 0;
      userGenrePrefs.set(genreName, currentCount + entry.views);
    });
    
    // Get IDs of books user has already viewed
    const viewedBookIds = new Set(userHistory.map(h => h.book_id));
    
    // Fetch all books and calculate popularity
    const [allBooks] = await pool.query<any[]>(
      `SELECT b.*, g.name as genre_name, COUNT(bh.id) as view_count
       FROM books b
       INNER JOIN genres g ON b.genre_id = g.id
       LEFT JOIN book_history bh ON b.id = bh.book_id
       GROUP BY b.id
       ORDER BY b.created_at DESC`
    );
    
    // Map view_count to Book type
    const booksWithPopularity: Book[] = allBooks.map(book => ({
      ...book,
      view_count: book.view_count || 0
    }));
    
    // Get candidate books (books user hasn't viewed yet)
    const candidateBooks = booksWithPopularity.filter(
      book => !viewedBookIds.has(book.id)
    );
    
    // Get personalized recommendations (min 10, max 20)
    const recommendations = getPersonalizedRecommendations(
      userGenrePrefs,
      candidateBooks,
      booksWithPopularity,
      15 // Request ~15 recommendations (will be clamped between 10-20)
    );
    
    return c.json({
      message: 'Personalized recommendations based on your history',
      userGenrePreferences: Object.fromEntries(userGenrePrefs),
      recommendations
    });
    
  } catch (error) {
    console.error('Personalized recommendation error:', error);
    return c.json({ error: 'Failed to get personalized recommendations' }, 500);
  }
});

/**
 * GET /recommend/user/:userId
 * Get personalized recommendations for specific user (pustakawan only)
 * Used by admin to see what recommendations are generated for a student
 */
recommend.get('/user/:userId', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const userId = parseInt(c.req.param('userId'));
    
    // Only allow pustakawan to view other users' recommendations
    if (user.role !== 'pustakawan' && user.id !== userId) {
      return c.json({ error: 'Forbidden - Can only view own recommendations' }, 403);
    }
    
    // Fetch user's viewing history with genre information
    const [userHistory] = await pool.query<any[]>(
      `SELECT bh.book_id, bh.views, b.genre_id, g.name as genre_name, b.created_at
       FROM book_history bh
       INNER JOIN books b ON bh.book_id = b.id
       INNER JOIN genres g ON b.genre_id = g.id
       WHERE bh.user_id = ?
       ORDER BY bh.views DESC`,
      [userId]
    );
    
    // If user has no history, return popular books
    if (userHistory.length === 0) {
      const [allBooks] = await pool.query<Book[]>(
        `SELECT b.*, g.name as genre_name, COUNT(bh.id) as view_count
         FROM books b
         INNER JOIN genres g ON b.genre_id = g.id
         LEFT JOIN book_history bh ON b.id = bh.book_id
         GROUP BY b.id
         ORDER BY view_count DESC, b.created_at DESC
         LIMIT 20`
      );
      
      return c.json({
        message: 'No viewing history. Returning popular books.',
        recommendations: allBooks.map(book => ({
          ...book,
          similarity: (book.view_count || 0) / 100
        }))
      });
    }
    
    // Build genre preference map from user's history
    const userGenrePrefs = new Map<string, number>();
    userHistory.forEach(entry => {
      const genreName = entry.genre_name.toLowerCase();
      const currentCount = userGenrePrefs.get(genreName) || 0;
      userGenrePrefs.set(genreName, currentCount + entry.views);
    });
    
    // Get IDs of books user has already viewed
    const viewedBookIds = new Set(userHistory.map(h => h.book_id));
    
    // Fetch all books and calculate popularity
    const [allBooks] = await pool.query<any[]>(
      `SELECT b.*, g.name as genre_name, COUNT(bh.id) as view_count
       FROM books b
       INNER JOIN genres g ON b.genre_id = g.id
       LEFT JOIN book_history bh ON b.id = bh.book_id
       GROUP BY b.id
       ORDER BY b.created_at DESC`
    );
    
    // Map view_count to Book type
    const booksWithPopularity: Book[] = allBooks.map(book => ({
      ...book,
      view_count: book.view_count || 0
    }));
    
    // Get candidate books (books user hasn't viewed yet)
    const candidateBooks = booksWithPopularity.filter(
      book => !viewedBookIds.has(book.id)
    );
    
    // Get personalized recommendations (min 10, max 20)
    const recommendations = getPersonalizedRecommendations(
      userGenrePrefs,
      candidateBooks,
      booksWithPopularity,
      15
    );
    
    return c.json({
      message: 'Personalized recommendations for student',
      recommendations
    });
    
  } catch (error) {
    console.error('User recommendation error:', error);
    return c.json({ error: 'Failed to get user recommendations' }, 500);
  }
});

/**
 * GET /recommend/:id
 * Get recommendations by book ID (public access)
 */
recommend.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // Fetch all books from database WITH GENRE NAME
    const [books] = await pool.query<Book[]>(
      `SELECT b.*, g.name as genre_name 
       FROM books b 
       INNER JOIN genres g ON b.genre_id = g.id`
    );
    
    if (books.length === 0) {
      return c.json({ error: 'No books available' }, 404);
    }
    
    // Find target book
    const targetBook = books.find(book => book.id === parseInt(id));
    
    if (!targetBook) {
      return c.json({ error: 'Book not found' }, 404);
    }
    
    // Get recommendations
    const recommendations = getRecommendations(targetBook, books, 10);
    
    return c.json({
      targetBook,
      recommendations
    });
    
  } catch (error) {
    console.error('Recommendation error:', error);
    return c.json({ error: 'Failed to get recommendations' }, 500);
  }
});

export default recommend;