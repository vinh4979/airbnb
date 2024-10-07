  import { Injectable, Logger } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';

  @Injectable()
  export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);

    constructor(private configService: ConfigService) {
      cloudinary.config({
        cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
        api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
        api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
      });
    }

    async uploadImage(file: Express.Multer.File, folder: string = 'uploads', filename?: string): Promise<CloudinaryResponse> {
      if (!file || !file.buffer) {
        throw new Error('Invalid file or empty buffer');
      }

      return new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          { 
            folder,
            public_id: filename || undefined,
            overwrite: true,
            resource_type: 'auto'
          },
          (error, result) => {
            if (error) {
              this.logger.error(`Upload failed: ${JSON.stringify(error)}`);
              reject(error);
            } else {
              this.logger.log(`Upload successful: ${JSON.stringify(result)}`);
              resolve(result as CloudinaryResponse);
            }
          }
        );

        upload.end(file.buffer);
      });
    }

    async deleteImage(publicId: string): Promise<CloudinaryResponse> {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            this.logger.error(`Delete failed: ${JSON.stringify(error)}`);
            reject(error);
          } else {
            this.logger.log(`Delete result: ${JSON.stringify(result)}`);
            resolve(result as CloudinaryResponse);
          }
        });
      });
    }

    getPublicURL(publicId: string, options: { format?: string; transformation?: string } = {}): string {
      const { format = 'jpg', transformation = '' } = options;
      return cloudinary.url(publicId, {
        format: format,
        transformation: transformation,
        secure: true,
      });
    }
  }
