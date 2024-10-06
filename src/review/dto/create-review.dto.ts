import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID của người dùng' })
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({ description: 'ID của property' })
  @IsInt()
  @IsNotEmpty()
  property_id: number;

  @ApiProperty({ description: 'Đánh giá từ 1 đến 5 sao' })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @ApiProperty({ description: 'Nhận xét của người dùng' })
  @IsString()
  @IsNotEmpty()
  comment: string;
}