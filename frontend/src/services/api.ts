import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors and 403/404
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    
    // 401 - Unauthorized: redirect to login
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // 403 - Forbidden: redirect to 404
    if (status === 403) {
      window.location.href = '/404';
    }
    
    // 404 - Not Found: redirect to 404
    if (status === 404) {
      window.location.href = '/404';
    }
    
    return Promise.reject(error);
  }
);

// ==================== TYPES ====================
export interface User {
  id: number;
  username: string;
  role: 'siswa' | 'pustakawan';
  created_at: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  genre_id: number;
  genre_name: string;
  synopsis: string;
  cover_img: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookWithSimilarity extends Book {
  similarity?: number;
}

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

export interface Genre {
  id: number;
  name: string;
  created_at: string;
}

// ==================== HELPER FUNCTIONS ====================
/**
 * Create URL-friendly slug from title
 */
export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ==================== AUTH APIs ====================
export const authAPI = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { username, password }),
  
  register: (username: string, password: string, role: 'siswa' | 'pustakawan' = 'siswa') =>
    api.post('/auth/register', { username, password, role }),
  
  logout: () => api.post('/auth/logout'),
};

// ==================== BOOKS APIs ====================
export const booksAPI = {
  getAll: () => api.get<{ books: Book[] }>('/books'),
  
  /**
   * Get book by SLUG (title with hyphens)
   * Example: getBySlug('matematika-untuk-sd-mi-kelas-1')
   */
  getBySlug: (slug: string) => api.get<{ book: Book }>(`/books/${slug}`),
  
  /**
   * Get book by ID (for admin/internal use)
   */
  getById: (id: number) => api.get<{ book: Book }>(`/books/${id}`),
  
  search: (query: string) =>
    api.get<{ books: Book[] }>(`/books/search?q=${encodeURIComponent(query)}`),
  
  create: (formData: FormData) =>
    api.post<{ message: string; bookId: number; slug: string }>('/books', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  update: (id: number, formData: FormData) =>
    api.put<{ message: string; slug: string }>(`/books/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  delete: (id: number) => api.delete<{ message: string }>(`/books/${id}`),
};

// ==================== RECOMMENDATION APIs ====================
export const recommendAPI = {
  getByBookId: (id: number) =>
    api.get<{ targetBook: Book; recommendations: BookWithSimilarity[] }>(`/recommend/${id}`),
  
  getByTitle: (title: string) =>
    api.get<{ targetBook: Book; recommendations: BookWithSimilarity[] }>(
      `/recommend?title=${encodeURIComponent(title)}`
    ),
  
  getPersonalized: () =>
    api.get<{
      message: string;
      userGenrePreferences: Record<string, number>;
      recommendations: BookWithSimilarity[];
    }>('/recommend/me'),
  
  getPersonalizedForUser: (userId: number) =>
    api.get<{
      message: string;
      recommendations: BookWithSimilarity[];
    }>(`/recommend/user/${userId}`),
};

// ==================== GENRES APIs ====================
export const genresAPI = {
  getAll: () => api.get<{ success: boolean; data: Genre[] }>('/genres'),
  
  create: (data: { name: string }) =>
    api.post<{ success: boolean; message: string; data: Genre }>('/genres', data),
  
  update: (id: number, data: { name: string }) =>
    api.put<{ success: boolean; message: string; data: Genre }>(`/genres/${id}`, data),
  
  delete: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/genres/${id}`),
};

// ==================== USERS APIs ====================
export const usersAPI = {
  getAll: () => api.get<{ users: User[] }>('/users'),
  
  getById: (id: number) => api.get<{ user: User }>(`/users/${id}`),
  
  create: (data: { username: string; password: string; role: 'siswa' | 'pustakawan' }) =>
    api.post<{ message: string; userId: number }>('/users', data),
  
  update: (id: number, data: { username?: string; password?: string; role?: 'siswa' | 'pustakawan' }) =>
    api.put<{ message: string }>(`/users/${id}`, data),
  
  delete: (id: number) => api.delete<{ message: string }>(`/users/${id}`),
  
  // Get all students with reading statistics
  getStudents: () => api.get<{
    message: string;
    students: Array<{
      id: number;
      username: string;
      role: string;
      created_at: string;
      total_books_read: number;
      total_views: number;
    }>;
  }>('/users/list/students'),
  
  // Get specific student's book history
  getStudentHistory: (studentId: number) => api.get<{
    message: string;
    student: { id: number; username: string; role: string };
    bookHistory: Array<{
      id: number;
      book_id: number;
      title: string;
      author: string;
      genre_id: number;
      genre_name: string;
      synopsis: string;
      cover_img: string | null;
      views: number;
      last_viewed: string;
    }>;
  }>(`/users/history/student/${studentId}`),
};

export default api;