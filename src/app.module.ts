import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtStrategy } from './auth/jwt.strategy';
import { PropertyModule } from './property/property.module';
import { BookingModule } from './booking/booking.module';
import { ReviewModule } from './review/review.module';
import { FavoriteModule } from './favorite/favorite.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, PropertyModule, BookingModule, ReviewModule, FavoriteModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, JwtStrategy],
  exports: [PrismaService],
})
export class AppModule {}
