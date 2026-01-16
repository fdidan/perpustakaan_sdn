// src/types/index.ts
import { RowDataPacket } from 'mysql2';

export interface User extends RowDataPacket {
  id: number;
  username: string;
  password: string;
  role: 'siswa' | 'pustakawan';
  created_at: Date;
}

export interface Genre extends RowDataPacket {
  id: number;
  name: string;
  created_at: Date;
}

export interface Book extends RowDataPacket {
  id: number;
  title: string;
  author: string;
  genre_id: number;
  genre_name?: string;
  synopsis: string;
  cover_img: string | null;
  created_at: Date;
  updated_at: Date;
  view_count?: number;
}

export interface JWTPayload {
  id: number;
  role: 'siswa' | 'pustakawan';
}

export interface BookWithSimilarity extends Book {
  similarity?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface BookRequest {
  title: string;
  author: string;
  genreId: number;
  synopsis: string;
  coverImage?: File;
}

export interface RecommendationResult {
  book: Book;
  similarity: number;
  recommendations: BookWithSimilarity[];
}