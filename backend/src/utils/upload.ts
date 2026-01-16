// src/utils/upload.ts
import { existsSync, mkdirSync, writeFileSync, unlinkSync, readdirSync } from 'fs';
import { join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

/**
 * Allowed image mime types
 */
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

/**
 * Max file size: 5MB
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Create slug from title (consistent with seeder format)
 */
export function createSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

/**
 * Generate filename from title with extension and handle duplicates
 */
export function generateFileNameFromTitle(title: string, originalExtension: string): string {
  const slug = createSlugFromTitle(title);
  const ext = originalExtension.toLowerCase();
  let fileName = `${slug}.${ext}`;
  
  // Check for duplicates and add suffix if needed
  let counter = 1;
  while (existsSync(join(UPLOAD_DIR, fileName))) {
    fileName = `${slug}-${counter}.${ext}`;
    counter++;
  }
  
  return fileName;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop() || 'jpg';
}

/**
 * Validate image file
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds 5MB limit.'
    };
  }

  return { valid: true };
}

/**
 * Save uploaded file with title-based naming
 */
export async function saveFileWithTitle(file: File, title: string): Promise<string> {
  const extension = getFileExtension(file.name);
  const fileName = generateFileNameFromTitle(title, extension);
  const filePath = join(UPLOAD_DIR, fileName);
  
  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Write file
  writeFileSync(filePath, buffer);
  
  return fileName;
}

/**
 * Delete old file and save new one
 */
export async function replaceFile(oldFileName: string | null, newFile: File, title: string): Promise<string> {
  // Delete old file if exists
  if (oldFileName) {
    deleteFile(oldFileName);
  }
  
  // Save new file
  return await saveFileWithTitle(newFile, title);
}

/**
 * Delete file from disk
 */
export function deleteFile(fileName: string): boolean {
  try {
    const filePath = join(UPLOAD_DIR, fileName);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Clean up unused files (optional utility)
 */
export function cleanupUnusedFiles(usedFileNames: string[]): number {
  try {
    const files = readdirSync(UPLOAD_DIR);
    let deletedCount = 0;
    
    for (const file of files) {
      if (!usedFileNames.includes(file)) {
        deleteFile(file);
        deletedCount++;
      }
    }
    
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up files:', error);
    return 0;
  }
}

/**
 * Get upload directory path
 */
export function getUploadDir(): string {
  return UPLOAD_DIR;
}