// src/db/mysql.ts
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'bookuser',
  password: process.env.DB_PASSWORD || 'bookpass123',
  database: process.env.DB_NAME || 'perpustakaan_sdn',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;