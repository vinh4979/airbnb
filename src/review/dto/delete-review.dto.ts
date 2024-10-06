import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class DeleteReviewDto {
  @ApiProperty({ description: 'ID của người dùng' })
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({ description: 'ID của đánh giá' })
  @IsInt()
  @IsNotEmpty()
  review_id: number;
}