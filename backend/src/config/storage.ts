import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);

export const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB
export const ALLOWED_TYPES = (process.env.ALLOWED_FILE_TYPES || 
  'image/jpeg,image/png,image/gif,image/webp,application/pdf').split(',');

// Storage subdirectories
export const STORAGE_PATHS = {
  avatars: path.join(UPLOAD_DIR, 'avatars'),
  documents: path.join(UPLOAD_DIR, 'documents'),
  attachments: path.join(UPLOAD_DIR, 'attachments'),
  temp: path.join(UPLOAD_DIR, 'temp'),
};

/**
 * Initialize storage directories
 */
export async function initializeStorage(): Promise<void> {
  try {
    // Create main upload directory
    await createDirIfNotExists(UPLOAD_DIR);

    // Create subdirectories
    for (const dir of Object.values(STORAGE_PATHS)) {
      await createDirIfNotExists(dir);
    }

    console.log('✅ Storage directories initialized');
  } catch (error) {
    console.error('❌ Failed to initialize storage:', error);
    throw error;
  }
}

/**
 * Create directory if it doesn't exist
 */
async function createDirIfNotExists(dirPath: string): Promise<void> {
  try {
    await access(dirPath, fs.constants.F_OK);
  } catch {
    await mkdir(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

/**
 * Get full file path
 */
export function getFilePath(category: keyof typeof STORAGE_PATHS, filename: string): string {
  return path.join(STORAGE_PATHS[category], filename);
}

/**
 * Get public URL for uploaded file
 */
export function getFileUrl(category: keyof typeof STORAGE_PATHS, filename: string): string {
  const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;
  return `${baseUrl}/uploads/${category}/${filename}`;
}

/**
 * Validate file type
 */
export function isValidFileType(mimeType: string): boolean {
  return ALLOWED_TYPES.includes(mimeType);
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  return `${nameWithoutExt}-${timestamp}-${randomStr}${ext}`;
}

/**
 * Delete file if exists
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await promisify(fs.unlink)(filePath);
    console.log(`🗑️  Deleted file: ${filePath}`);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}
