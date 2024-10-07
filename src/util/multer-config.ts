
import { memoryStorage } from 'multer';
import { Request } from 'express';
import { FileFilterCallback } from 'multer';
export const multerOptions = {
  storage: memoryStorage(),
  fileFilter: (req : Request, file: Express.Multer.File, callback: FileFilterCallback) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      callback(null, true);
    } else {
      callback(new Error('Unsupported file type') as any, false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  }
};