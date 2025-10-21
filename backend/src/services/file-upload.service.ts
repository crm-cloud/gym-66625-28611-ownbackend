import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * File Upload Service
 * Handles file upload operations
 */

export interface UploadOptions {
  destination?: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

export interface UploadedFileInfo {
  filename: string;
  originalname: string;
  path: string;
  size: number;
  mimetype: string;
  url: string;
}

class FileUploadService {
  private readonly BASE_UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB default

  /**
   * Upload single file
   */
  async uploadFile(
    file: Express.Multer.File,
    options?: UploadOptions
  ): Promise<UploadedFileInfo> {
    // Validate file size
    const maxSize = options?.maxSize || this.MAX_FILE_SIZE;
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize} bytes`);
    }

    // Validate file type
    if (options?.allowedTypes && options.allowedTypes.length > 0) {
      const isAllowed = options.allowedTypes.some(type =>
        file.mimetype.startsWith(type)
      );
      if (!isAllowed) {
        throw new Error(
          `File type ${file.mimetype} is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`
        );
      }
    }

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const destination = options?.destination || 'general';
    const uploadPath = path.join(this.BASE_UPLOAD_DIR, destination);

    // Ensure directory exists
    await fs.mkdir(uploadPath, { recursive: true });

    // Save file
    const fullPath = path.join(uploadPath, filename);
    await fs.writeFile(fullPath, file.buffer);

    return {
      filename,
      originalname: file.originalname,
      path: fullPath,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${destination}/${filename}`,
    };
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    options?: UploadOptions
  ): Promise<UploadedFileInfo[]> {
    return Promise.all(
      files.map(file => this.uploadFile(file, options))
    );
  }

  /**
   * Delete file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMultipleFiles(filePaths: string[]): Promise<void> {
    await Promise.all(
      filePaths.map(path => this.deleteFile(path))
    );
  }

  /**
   * Get file info
   */
  async getFileInfo(filePath: string) {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
      };
    } catch (error) {
      throw new Error('File not found');
    }
  }

  /**
   * Upload avatar/profile picture
   */
  async uploadAvatar(file: Express.Multer.File): Promise<UploadedFileInfo> {
    return this.uploadFile(file, {
      destination: 'avatars',
      maxSize: 2 * 1024 * 1024, // 2MB for avatars
      allowedTypes: ['image/'],
    });
  }

  /**
   * Upload document
   */
  async uploadDocument(file: Express.Multer.File): Promise<UploadedFileInfo> {
    return this.uploadFile(file, {
      destination: 'documents',
      maxSize: 10 * 1024 * 1024, // 10MB for documents
      allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats'],
    });
  }

  /**
   * Upload exercise video
   */
  async uploadExerciseVideo(file: Express.Multer.File): Promise<UploadedFileInfo> {
    return this.uploadFile(file, {
      destination: 'exercises',
      maxSize: 50 * 1024 * 1024, // 50MB for videos
      allowedTypes: ['video/'],
    });
  }
}

export const fileUploadService = new FileUploadService();
