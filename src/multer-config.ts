import { memoryStorage } from 'multer';

export const multerOptions = {
  storage: memoryStorage(),
  fileFilter: (req, file, callback) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      callback(null, true);
    } else {
      callback(new Error('Unsupported file type'), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  }
};