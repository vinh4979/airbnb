import { Controller, Post, Delete, Body, Get, Param, UseGuards } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteDto } from './dto/favorite.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Favorites')
@Controller('favorites')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  @ApiOperation({ summary: 'Thêm property vào danh sách yêu thích' })
  @ApiResponse({ status: 201, description: 'Property đã được thêm vào danh sách yêu thích.' })
  async addFavorite(@Body() favoriteDto: FavoriteDto) {
    return this.favoriteService.addFavorite(favoriteDto);
  }

  @Delete()
  @ApiOperation({ summary: 'Xóa property khỏi danh sách yêu thích' })
  @ApiResponse({ status: 200, description: 'Property đã được xóa khỏi danh sách yêu thích.' })
  async removeFavorite(@Body() favoriteDto: FavoriteDto) {
    return this.favoriteService.removeFavorite(favoriteDto);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Lấy danh sách property yêu thích của người dùng' })
  @ApiResponse({ status: 200, description: 'Danh sách property yêu thích.' })
  async getUserFavorites(@Param('userId') userId: string) {
    return this.favoriteService.getUserFavorites(+userId);
  }
}
