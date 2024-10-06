import { Controller, Get, Post, Body, Param, UseGuards, Request, Put, Delete } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateReviewRatingDto } from './dto/update-review-rating.dto';
import { UpdateReviewCommentDto } from './dto/update-review-comment.dto';
import { DeleteReviewDto } from './dto/delete-review.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đánh giá mới' })
  @ApiResponse({ status: 201, description: 'Đánh giá đã được tạo thành công.' })
  async createReview(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.createReview(createReviewDto);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Lấy tất cả đánh giá của một property' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách đánh giá.' })
  async getPropertyReviews(@Param('propertyId') propertyId: string) {
    return this.reviewService.getPropertyReviews(+propertyId);
  }

  @Put('rating')
@ApiOperation({ summary: 'Cập nhật đánh giá sao của một review' })
@ApiResponse({ status: 200, description: 'Đánh giá đã được cập nhật thành công.' })
async updateReviewRating(@Body() updateReviewRatingDto: UpdateReviewRatingDto) {
  return this.reviewService.updateReviewRating(updateReviewRatingDto);
}

@Put('comment')
@ApiOperation({ summary: 'Cập nhật nhận xét của một review' })
@ApiResponse({ status: 200, description: 'Nhận xét đã được cập nhật thành công.' })
async updateReviewComment(@Body() updateReviewCommentDto: UpdateReviewCommentDto) {
  return this.reviewService.updateReviewComment(updateReviewCommentDto);
}

@Delete()
@ApiOperation({ summary: 'Xóa một đánh giá' })
@ApiResponse({ status: 200, description: 'Đánh giá đã được xóa thành công.' })
@ApiResponse({ status: 404, description: 'Không tìm thấy đánh giá hoặc không có quyền xóa.' })
async deleteReview(@Body() deleteReviewDto: DeleteReviewDto) {
  return this.reviewService.deleteReview(deleteReviewDto);
}

}
