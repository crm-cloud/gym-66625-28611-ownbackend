import { api } from './axios';

/**
 * Upload a single file to the backend
 */
export async function uploadFile(file: File, category?: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const config: any = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };

  if (category) {
    config.headers['x-upload-category'] = category;
  }

  const { data } = await api.post('/api/files/upload', formData, config);
  
  return data.url; // Return S3/local URL
}

/**
 * Upload multiple files to the backend
 */
export async function uploadMultipleFiles(files: File[], category?: string): Promise<string[]> {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append('files', file);
  });

  const config: any = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };

  if (category) {
    config.headers['x-upload-category'] = category;
  }

  const { data } = await api.post('/api/files/upload-multiple', formData, config);
  
  return data.files.map((f: any) => f.url);
}

/**
 * Upload avatar/profile picture
 */
export async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('avatar', file);

  const { data } = await api.post('/api/files/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return data.url;
}

/**
 * Delete file from backend
 */
export async function deleteFile(fileKey: string): Promise<void> {
  await api.delete(`/api/files/${fileKey}`);
}
