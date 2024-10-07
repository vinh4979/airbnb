import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CloudinaryService } from 'src/config/cloundinary/cloudinary.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from 'src/config/config.module';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  // imports: [
  //   PrismaModule,
  //   MulterModule.register({
  //     dest: './uploads',
  //   }),
  //   ConfigModule,
    
  // ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}