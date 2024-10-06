import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class FavoriteDto {
  @ApiProperty({ description: 'ID của người dùng' })
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({ description: 'ID của property' })
  @IsInt()
  @IsNotEmpty()
  property_id: number;
}