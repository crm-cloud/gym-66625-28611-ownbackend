import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { upload } from '../middleware/upload';
import { fileController } from '../controllers/file.controller';

const router = Router();

router.use(authenticate);

// Single file upload
router.post('/upload', upload.single('file'), fileController.uploadFile);

// Multiple files upload
router.post('/upload-multiple', upload.array('files', 10), fileController.uploadMultiple);

// Avatar upload
router.post('/upload-avatar', upload.single('avatar'), fileController.uploadAvatar);

// Delete file
router.delete('/:fileKey', fileController.deleteFile);

export default router;
