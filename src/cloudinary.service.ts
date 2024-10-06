  import { Injectable, Logger } from '@nestjs/common';
  import { ConfigService } from 'src/config/config.service';
  import { v2 as cloudinary } from 'cloudinary';

  @Injectable()
  export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);

    constructor(private configService: ConfigService) {
      cloudinary.config({
        cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
        api_key: this.configService.get('CLOUDINARY_API_KEY'),
        api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
      });
    }

    async uploadImage(file: Express.Multer.File): Promise<any> {
      return new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          { folder: 'uploads' },
          (error, result) => {
            if (error) {
              this.logger.error(`Upload failed: ${JSON.stringify(error)}`);
              reject(error);
            } else {
              this.logger.log(`Upload successful: ${JSON.stringify(result)}`);
              resolve(result);
            }
          }
        );
  
        upload.end(file.buffer);
      });
    }

    // async uploadImage(file: Express.Multer.File): Promise<any> {
    //   if (!file || !file.buffer) {
    //     throw new Error('Invalid file or empty buffer');
    //   }
    
    //   return new Promise((resolve, reject) => {
    //     const upload = cloudinary.uploader.upload_stream(
    //       { folder: 'uploads' },
    //       (error, result) => {
    //         if (error) {
    //           this.logger.error(`Upload failed: ${JSON.stringify(error)}`);
    //           reject(error);
    //         } else {
    //           this.logger.log(`Upload successful: ${JSON.stringify(result)}`);
    //           resolve(result);
    //         }
    //       }
    //     );
    
    //     upload.end(file.buffer);
    //   });
    // }

    async deleteImage(publicId: string): Promise<any> {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            this.logger.error(`Delete failed: ${JSON.stringify(error)}`);
            reject(error);
          } else {
            this.logger.log(`Delete result: ${JSON.stringify(result)}`);
            resolve(result);
          }
        });
      });
    }}
