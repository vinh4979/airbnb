import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
