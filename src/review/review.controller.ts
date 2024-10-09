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
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: 201, description: 'Review created successfully.' })
  async createReview(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.createReview(createReviewDto);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get all reviews for a property' })
  @ApiResponse({ status: 200, description: 'Returns the list of reviews.' })
  async getPropertyReviews(@Param('propertyId') propertyId: string) {
    return this.reviewService.getPropertyReviews(+propertyId);
  }

  @Put('rating')
@ApiOperation({ summary: 'Update the rating of a review' })
@ApiResponse({ status: 200, description: 'Rating updated successfully.' })
async updateReviewRating(@Body() updateReviewRatingDto: UpdateReviewRatingDto) {
  return this.reviewService.updateReviewRating(updateReviewRatingDto);
}

@Put('comment')
@ApiOperation({ summary: 'Update the comment of a review' })
@ApiResponse({ status: 200, description: 'Comment updated successfully.' })
async updateReviewComment(@Body() updateReviewCommentDto: UpdateReviewCommentDto) {
  return this.reviewService.updateReviewComment(updateReviewCommentDto);
}

@Delete()
@ApiOperation({ summary: 'Delete a review' })
@ApiResponse({ status: 200, description: 'Review deleted successfully.' })
@ApiResponse({ status: 404, description: 'Review not found or no permission to delete.' })
async deleteReview(@Body() deleteReviewDto: DeleteReviewDto) {
  return this.reviewService.deleteReview(deleteReviewDto);
}

}
