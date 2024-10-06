import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma.module';
import { CloudinaryService } from 'src/cloudinary.service';
import { ConfigModule } from 'src/config/config.module';
import { MulterModule } from '@nestjs/platform-express';


@Module({
  imports: [JwtModule.register({}), PrismaModule,ConfigModule, MulterModule.register({
    dest: './uploads',
  })],
  controllers: [AuthController],
  providers: [AuthService, CloudinaryService],
})
export class AuthModule {}
