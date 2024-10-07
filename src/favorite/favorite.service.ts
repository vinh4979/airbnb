import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FavoriteDto } from './dto/favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(private prisma: PrismaService) {}

  async addFavorite(favoriteDto: FavoriteDto) {
    const { user_id, property_id } = favoriteDto;

    // Kiểm tra xem user và property có tồn tại không
    const user = await this.prisma.user.findUnique({ where: { user_id } });
    const property = await this.prisma.properties.findUnique({ where: { property_id } });

    if (!user) {
      throw new NotFoundException(`User với ID ${user_id} không tồn tại`);
    }
    if (!property) {
      throw new NotFoundException(`Property với ID ${property_id} không tồn tại`);
    }

    // Kiểm tra xem đã favorite chưa
    const existingFavorite = await this.prisma.favorites.findUnique({
      where: {
        user_id_property_id: {
          user_id,
          property_id,
        },
      },
    });

    if (existingFavorite) {
      throw new BadRequestException('Property này đã được thêm vào danh sách yêu thích');
    }

    // Thêm vào danh sách yêu thích
    const favorite = await this.prisma.favorites.create({
      data: {
        user_id,
        property_id,
      },
    });

    return { message: 'Đã thêm vào danh sách yêu thích', favorite };
  }

  async removeFavorite(favoriteDto: FavoriteDto) {
    const { user_id, property_id } = favoriteDto;

    const favorite = await this.prisma.favorites.findUnique({
      where: {
        user_id_property_id: {
          user_id,
          property_id,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Property này không có trong danh sách yêu thích');
    }

    await this.prisma.favorites.delete({
      where: {
        user_id_property_id: {
          user_id,
          property_id,
        },
      },
    });

    return { message: 'Đã xóa khỏi danh sách yêu thích' };
  }

  async getUserFavorites(userId: number) {
    const favorites = await this.prisma.favorites.findMany({
      where: { user_id: userId },
      include: { Properties: true },
    });

    return favorites;
  }
}