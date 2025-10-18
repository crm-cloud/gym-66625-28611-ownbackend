import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { 
  STORAGE_PATHS, 
  MAX_FILE_SIZE, 
  ALLOWED_TYPES, 
  generateUniqueFilename,
  isValidFileType 
} from '../config/storage';

// Storage configuration
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Determine storage path based on field name or custom header
    const category = req.headers['x-upload-category'] as keyof typeof STORAGE_PATHS || 'attachments';
    const destinationPath = STORAGE_PATHS[category] || STORAGE_PATHS.attachments;
    cb(null, destinationPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueFilename = generateUniqueFilename(file.originalname);
    cb(null, uniqueFilename);
  }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (isValidFileType(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // Max 10 files per request
  }
});

// Named upload configurations
export const uploadSingle = (fieldName: string) => upload.single(fieldName);
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => upload.array(fieldName, maxCount);
export const uploadFields = (fields: { name: string; maxCount: number }[]) => upload.fields(fields);

// Avatar-specific upload
export const uploadAvatar = upload.single('avatar');

// Progress photo upload
export const uploadProgressPhotos = upload.array('photos', 10);

// Document upload
export const uploadDocuments = upload.array('documents', 5);

// Task attachments
export const uploadTaskAttachments = upload.array('attachments', 5);
