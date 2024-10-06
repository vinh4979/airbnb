import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class UpdateReviewRatingDto {
  @ApiProperty({ description: 'ID của người dùng' })
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({ description: 'ID của đánh giá' })
  @IsInt()
  @IsNotEmpty()
  review_id: number;

  @ApiProperty({ description: 'Đánh giá mới từ 1 đến 5 sao' })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;
}