import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class UpdateReviewCommentDto {
  @ApiProperty({ description: 'ID của người dùng' })
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({ description: 'ID của đánh giá' })
  @IsInt()
  @IsNotEmpty()
  review_id: number;

  @ApiProperty({ description: 'Nhận xét mới của người dùng' })
  @IsString()
  @IsNotEmpty()
  comment: string;
}