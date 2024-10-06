import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma.module';
import { CloudinaryService } from 'src/cloudinary.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      dest: './uploads',
    }),
    ConfigModule,
    
  ],
  controllers: [UserController],
  providers: [UserService, CloudinaryService],
})
export class UserModule {}