import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewCommentDto } from './dto/update-review-comment.dto';
import { UpdateReviewRatingDto } from './dto/update-review-rating.dto';
import { DeleteReviewDto } from './dto/delete-review.dto';

@Injectable()
export class ReviewService {
  constructor(private prismaService: PrismaService) {}

  async createReview(createReviewDto: CreateReviewDto) {
    // Kiểm tra xem người dùng đã từng đặt phòng này chưa
    const userBooking = await this.prismaService.bookings.findFirst({
      where: {
        user_id: createReviewDto.user_id,
        property_id: createReviewDto.property_id,
        status: 'confirmed', // Chỉ cho phép đánh giá các đặt phòng đã hoàn thành
      },
    });
  
    if (!userBooking) {
      throw new BadRequestException('Bạn chỉ có thể đánh giá các property mà bạn đã từng đặt và hoàn thành');
    }
  
    // Kiểm tra xem người dùng đã đánh giá property này chưa
    const existingReview = await this.prismaService.propertyReviews.findFirst({
      where: {
        user_id: createReviewDto.user_id,
        property_id: createReviewDto.property_id,
      },
    });
  
    if (existingReview) {
      throw new BadRequestException('Bạn đã đánh giá property này rồi');
    }
  
    // Tạo đánh giá mới
    const newReview = await this.prismaService.propertyReviews.create({
      data: {
        property_id: createReviewDto.property_id,
        user_id: createReviewDto.user_id,
        booking_id: userBooking.booking_id, // Sử dụng booking_id từ đặt phòng đã tìm thấy
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
      },
    });
  
    return {
      message: 'Đánh giá đã được tạo thành công',
      data: newReview,
    };
  }
  async getPropertyReviews(propertyId: number) {
    const reviews = await this.prismaService.propertyReviews.findMany({
      where: { property_id: propertyId },
      include: { User: true },
    });

    return reviews;
  }

  async updateReviewRating(updateReviewRatingDto: UpdateReviewRatingDto) {
    const review = await this.prismaService.propertyReviews.findFirst({
      where: {
        review_id: updateReviewRatingDto.review_id,
        user_id: updateReviewRatingDto.user_id,
      },
    });
  
    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá hoặc bạn không có quyền chỉnh sửa đánh giá này');
    }
  
    const updatedReview = await this.prismaService.propertyReviews.update({
      where: { review_id: updateReviewRatingDto.review_id },
      data: { rating: updateReviewRatingDto.rating },
    });
  
    return {
      message: 'Đã cập nhật đánh giá thành công',
      data: updatedReview,
    };
  }
  
  async updateReviewComment(updateReviewCommentDto: UpdateReviewCommentDto) {
    const review = await this.prismaService.propertyReviews.findFirst({
      where: {
        review_id: updateReviewCommentDto.review_id,
        user_id: updateReviewCommentDto.user_id,
      },
    });
  
    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá hoặc bạn không có quyền chỉnh sửa đánh giá này');
    }
  
    const updatedReview = await this.prismaService.propertyReviews.update({
      where: { review_id: updateReviewCommentDto.review_id },
      data: { comment: updateReviewCommentDto.comment },
    });
  
    return {
      message: 'Đã cập nhật nhận xét thành công',
      data: updatedReview,
    };
  }

  async deleteReview(deleteReviewDto: DeleteReviewDto) {
    const review = await this.prismaService.propertyReviews.findFirst({
      where: {
        review_id: deleteReviewDto.review_id,
        user_id: deleteReviewDto.user_id,
      },
    });
  
    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá hoặc bạn không có quyền xóa đánh giá này');
    }
  
    await this.prismaService.propertyReviews.delete({
      where: { review_id: deleteReviewDto.review_id },
    });
  
    return {
      message: 'Đã xóa đánh giá thành công',
    };
  }
}
