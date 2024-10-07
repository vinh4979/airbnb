import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PropertyModule } from './property/property.module';
import { BookingModule } from './booking/booking.module';
import { ReviewModule } from './review/review.module';
import { FavoriteModule } from './favorite/favorite.module';
import { CloudinaryModule } from './config/cloundinary/cloudinary.module';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CloudinaryModule,
    UserModule,
    AuthModule,
    PropertyModule,
    BookingModule,
    ReviewModule,
    FavoriteModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}