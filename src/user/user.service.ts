import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { CloudinaryService } from 'src/config/cloundinary/cloudinary.service';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateUserDto } from './user.types';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService,
        private cloudinaryService: CloudinaryService
    ) {}

    async getAllUsers(): Promise<User[]> {
        return this.prisma.user.findMany();
    }

    async getUserById(id: string) {
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
          throw new Error('Invalid ID');
        }
        return this.prisma.user.findUnique({
          where: {
            user_id: userId
          }
        });
    }

    async searchUsers(name: string): Promise<User[]> {
        return this.prisma.user.findMany({
          where: {
            name: {
              contains: name.toLowerCase(),
            }
          }
        });
    }   
      
    async searchUsersByEmail(email: string): Promise<User[]> {
        return this.prisma.user.findMany({
          where: {
            email: {
              contains: email.toLowerCase(),
            }
          }
        });
    }

    async updateUser(userId: number, updateUserDto: UpdateUserDto, file?: Express.Multer.File) {
        const user = await this.prisma.user.findUnique({ where: { user_id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        let avatarUrl = null;
        if (file) {
            if (user.avatar) {
                const oldPublicId = this.getPublicIdFromUrl(user.avatar);
                await this.cloudinaryService.deleteImage(oldPublicId);
            }
            const uploadResult = await this.cloudinaryService.uploadImage(file);
            avatarUrl = uploadResult.secure_url;
        }

        let parsedBirthDay: Date | null = null;
        if (updateUserDto.birth_day) {
            parsedBirthDay = new Date(updateUserDto.birth_day);
            if (isNaN(parsedBirthDay.getTime())) {
                throw new ForbiddenException('Invalid birth date. Please use the format YYYY-MM-DD');
            }
        }

        const updatedData: Prisma.UserUpdateInput = {
            name: updateUserDto.name || user.name,
            phone: updateUserDto.phone || user.phone,
            birth_day: parsedBirthDay || user.birth_day,
            gender: updateUserDto.gender || user.gender,
            avatar: avatarUrl || user.avatar,
            role: updateUserDto.role || user.role
        };

        const updatedUser = await this.prisma.user.update({
            where: { user_id: userId },
            data: updatedData
        });

        return {
            message: 'User information has been updated successfully',
            data: updatedUser
        };
    }

    private getPublicIdFromUrl(url: string): string {
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        return filename.split('.')[0];
    }
}



