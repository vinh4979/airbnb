import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { PrismaModule } from 'src/prisma.module';
import { CloudinaryService } from 'src/cloudinary.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    PrismaModule,
    ConfigModule,
  ],
  controllers: [PropertyController],
  providers: [PropertyService, CloudinaryService],
})
export class PropertyModule {}
