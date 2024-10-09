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
  @ApiOperation({ summary: 'Add property to favorites list' })
  @ApiResponse({ status: 201, description: 'Property added to favorites list.' })
  async addFavorite(@Body() favoriteDto: FavoriteDto) {
    return this.favoriteService.addFavorite(favoriteDto);
  }

  @Delete()
  @ApiOperation({ summary: 'Remove property from favorites list' })
  @ApiResponse({ status: 200, description: 'Property removed from favorites list.' })
  async removeFavorite(@Body() favoriteDto: FavoriteDto) {
    return this.favoriteService.removeFavorite(favoriteDto);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user\'s favorite properties list' })
  @ApiResponse({ status: 200, description: 'List of favorite properties.' })
  async getUserFavorites(@Param('userId') userId: string) {
    return this.favoriteService.getUserFavorites(+userId);
  }
}
