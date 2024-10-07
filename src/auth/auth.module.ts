import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from 'src/config/config.module';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaModule } from 'prisma/prisma.module';
import { JwtConfigModule } from 'src/config/jwt/jwt.module';


@Module({
  imports: [JwtConfigModule,ConfigModule, MulterModule.register({
    dest: './uploads',
  })],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
