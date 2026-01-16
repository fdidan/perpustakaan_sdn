// backend/src/services/recommendation.ts

import type { Book, BookWithSimilarity } from '../types';
import { calculateTFIDF, cosineSimilarity } from './tfidf';

/**
 * SISTEM REKOMENDASI SESUAI PROPOSAL
 * ====================================
 * 1. Ekstrak fitur dari Judul (TF-IDF)
 * 2. Ekstrak fitur dari Sinopsis (TF-IDF)
 * 3. Ekstrak fitur dari Genre (Multi-Hot Encoding)
 * 4. Gabungkan ketiga vektor (concatenate)
 * 5. Hitung Cosine Similarity
 */

/**
 * Multi-Hot Encoding untuk Genre
 * Setiap genre mendapat indeks, dan setiap buku direpresentasikan dengan vektor biner
 */
function createGenreVector(book: Book, allGenres: string[]): number[] {
  const vector = new Array(allGenres.length).fill(0);
  
  // DEFENSIVE: Check if genre_name exists
  if (!book.genre_name) {
    console.warn(`Book "${book.title}" (ID: ${book.id}) has no genre_name`);
    return vector;
  }
  
  // Pisahkan genre jika ada multiple genre (separated by comma)
  const bookGenres = book.genre_name
    .split(',')
    .map(g => g.trim().toLowerCase());
  
  // Set 1 untuk genre yang dimiliki buku ini
  allGenres.forEach((genre, index) => {
    if (bookGenres.includes(genre.toLowerCase())) {
      vector[index] = 1;
    }
  });
  
  return vector;
}

/**
 * Ekstrak semua unique genres dari semua buku
 */
function extractAllGenres(books: Book[]): string[] {
  const genreSet = new Set<string>();
  
  books.forEach(book => {
    // DEFENSIVE: Check if genre_name exists
    if (!book.genre_name) {
      console.warn(`Book "${book.title}" (ID: ${book.id}) has no genre_name`);
      return;
    }
    
    const genres = book.genre_name
      .split(',')
      .map(g => g.trim().toLowerCase());
    genres.forEach(g => genreSet.add(g));
  });
  
  return Array.from(genreSet).sort();
}

/**
 * Gabungkan TF-IDF vector dengan Genre vector
 * SESUAI TABLE 3.12: [Title TF-IDF | Genre Multi-Hot | Synopsis TF-IDF]
 */
function combineVectors(
  titleVector: Map<string, number>,
  genreVector: number[],
  synopsisVector: Map<string, number>,
  allTitleTerms: Set<string>,
  allSynopsisTerms: Set<string>
): Map<string, number> {
  const combinedVector = new Map<string, number>();
  
  // 1. Masukkan Title TF-IDF values dengan prefix 'title_'
  for (const term of allTitleTerms) {
    combinedVector.set(`title_${term}`, titleVector.get(term) || 0);
  }
  
  // 2. Masukkan Genre values dengan prefix 'genre_'
  genreVector.forEach((value, index) => {
    combinedVector.set(`genre_${index}`, value);
  });
  
  // 3. Masukkan Synopsis TF-IDF values dengan prefix 'synopsis_'
  for (const term of allSynopsisTerms) {
    combinedVector.set(`synopsis_${term}`, synopsisVector.get(term) || 0);
  }
  
  return combinedVector;
}

/**
 * Get book recommendations using Content-Based Filtering
 * SESUAI PROPOSAL BAB 3
 */
export function getRecommendations(
  targetBook: Book,
  allBooks: Book[],
  topN: number = 10
): BookWithSimilarity[] {
  // DEFENSIVE: Filter out books without genre_name
  const validBooks = allBooks.filter(book => {
    if (!book.genre_name) {
      console.warn(`Skipping book "${book.title}" (ID: ${book.id}) - no genre_name`);
      return false;
    }
    return true;
  });

  if (validBooks.length === 0) {
    console.error('No valid books found for recommendation');
    return [];
  }

  // Step 1: Ekstrak semua unique genres
  const allGenres = extractAllGenres(validBooks);
  
  // Step 2: Buat Multi-Hot Encoding untuk genre setiap buku
  const genreVectors = validBooks.map(book => createGenreVector(book, allGenres));
  
  // Step 3: Hitung TF-IDF untuk JUDUL
  const titleDocuments = validBooks.map(book => book.title);
  const titleTFIDF = calculateTFIDF(titleDocuments);
  
  // Step 4: Hitung TF-IDF untuk SINOPSIS
  const synopsisDocuments = validBooks.map(book => book.synopsis || '');
  const synopsisTFIDF = calculateTFIDF(synopsisDocuments);
  
  // Step 5: Gabungkan semua terms dari title dan synopsis untuk normalisasi
  const allTitleTerms = new Set<string>();
  const allSynopsisTerms = new Set<string>();
  
  titleTFIDF.forEach(vector => {
    vector.forEach((_, term) => allTitleTerms.add(term));
  });
  
  synopsisTFIDF.forEach(vector => {
    vector.forEach((_, term) => allSynopsisTerms.add(term));
  });
  
  // Step 6: Gabungkan fitur untuk setiap buku
  // SESUAI TABLE 3.12: [Title TF-IDF | Genre Multi-Hot | Synopsis TF-IDF]
  const combinedVectors = validBooks.map((book, index) => {
    const titleVec = titleTFIDF.get(index) || new Map();
    const synopsisVec = synopsisTFIDF.get(index) || new Map();
    const genreVec = genreVectors[index];
    
    // Combine: Title + Genre + Synopsis (SESUAI PROPOSAL TABLE 3.12)
    return combineVectors(titleVec, genreVec, synopsisVec, allTitleTerms, allSynopsisTerms);
  });
  
  // Step 7: Find index of target book
  const targetIndex = validBooks.findIndex(book => book.id === targetBook.id);
  
  if (targetIndex === -1) {
    console.error(`Target book "${targetBook.title}" (ID: ${targetBook.id}) not found in valid books`);
    return [];
  }
  
  const targetVector = combinedVectors[targetIndex];
  
  // Step 8: Calculate similarity dengan semua buku lainnya
  const similarities: Array<{ book: Book; similarity: number }> = [];
  
  for (let i = 0; i < validBooks.length; i++) {
    // Skip target book itself
    if (i === targetIndex) continue;
    
    const currentVector = combinedVectors[i];
    const similarity = cosineSimilarity(targetVector, currentVector);
    
    similarities.push({
      book: validBooks[i],
      similarity
    });
  }
  
  // Step 9: Sort by similarity (descending) dan ambil top N
  similarities.sort((a, b) => b.similarity - a.similarity);
  
  return similarities.slice(0, topN).map(item => ({
    ...item.book,
    similarity: item.similarity
  }));
}

/**
 * Get recommendations by book title (search-based)
 */
export function getRecommendationsByTitle(
  title: string,
  allBooks: Book[],
  topN: number = 10
): BookWithSimilarity[] {
  // Find book by title (case-insensitive, partial match)
  const targetBook = allBooks.find(book => 
    book.title.toLowerCase().includes(title.toLowerCase())
  );
  
  if (!targetBook) {
    console.warn(`No book found with title containing: "${title}"`);
    return [];
  }
  
  return getRecommendations(targetBook, allBooks, topN);
}

/**
 * Get personalized recommendations based on user's viewing history
 * Scores books based on genre preferences inferred from history + global popularity
 * 
 * @param userHistoryGenres Map of genre -> total views from user's history
 * @param candidateBooks Books not yet seen by user (available for recommendation)
 * @param allBooks All books in system (for popularity calculation)
 * @param topN Number of recommendations to return (default 10, max 20)
 * @returns Array of books with similarity scores
 */
export function getPersonalizedRecommendations(
  userHistoryGenres: Map<string, number>,
  candidateBooks: Book[],
  allBooks: Book[],
  topN: number = 10
): BookWithSimilarity[] {
  if (candidateBooks.length === 0) {
    return [];
  }
  
  // Normalize topN: min 10, max 20
  const normalizedTopN = Math.min(Math.max(topN, 10), 20);
  
  // Calculate global book popularity (by view count)
  const bookPopularity = new Map<number, number>();
  allBooks.forEach(book => {
    bookPopularity.set(book.id, book.view_count || 0);
  });
  
  // Calculate max popularity for normalization
  const maxPopularity = Math.max(
    ...Array.from(bookPopularity.values()),
    1 // Prevent division by zero
  );
  
  // Calculate total user views for normalization
  const totalUserViews = Array.from(userHistoryGenres.values()).reduce((a, b) => a + b, 0);
  const normalizedUserViews = Math.max(totalUserViews, 1);
  
  // Score each candidate book
  const scoredBooks: Array<{ book: Book; score: number }> = [];
  
  candidateBooks.forEach(book => {
    let score = 0;
    
    // 1. Genre matching score (40% weight)
    if (book.genre_name) {
      const bookGenres = book.genre_name
        .split(',')
        .map(g => g.trim().toLowerCase());
      
      let genreMatchWeight = 0;
      bookGenres.forEach(genre => {
        const genreViewCount = userHistoryGenres.get(genre) || 0;
        genreMatchWeight += genreViewCount;
      });
      
      // Normalize genre match
      const normalizedGenreMatch = genreMatchWeight / normalizedUserViews;
      score += normalizedGenreMatch * 0.4;
    }
    
    // 2. Popularity score (30% weight)
    const popularity = bookPopularity.get(book.id) || 0;
    const normalizedPopularity = popularity / maxPopularity;
    score += normalizedPopularity * 0.3;
    
    // 3. Recency bonus (30% weight) - books created more recently get slight boost
    if (book.created_at) {
      const bookDate = new Date(book.created_at);
      const daysSinceCreated = (Date.now() - bookDate.getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 1 - (daysSinceCreated / 365)); // Decay over 1 year
      score += recencyScore * 0.3;
    }
    
    scoredBooks.push({ book, score });
  });
  
  // Sort by score descending and return top N
  scoredBooks.sort((a, b) => b.score - a.score);
  
  return scoredBooks.slice(0, normalizedTopN).map(item => ({
    ...item.book,
    similarity: item.score
  }));
}