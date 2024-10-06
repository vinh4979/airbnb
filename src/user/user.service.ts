import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary.service';
import { PrismaService } from 'src/prisma.service';
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
        throw new NotFoundException('Không tìm thấy người dùng');
      }
      console.log("check - user - from - database user",user);
      console.log("check - user - from - inputform",updateUserDto);
    
      let avatarUrl = null;
      console.log("check - file",file);
      if (file) {
        console.log("check - file",user.avatar);
        if (user.avatar) {
          const oldPublicId = this.getPublicIdFromUrl(user.avatar);
          await this.cloudinaryService.deleteImage(oldPublicId);
        }
        const uploadResult = await this.cloudinaryService.uploadImage(file);
        avatarUrl = uploadResult.secure_url;
      }

      let parsedBirthDay: Date | null = null;
      console.log("check parsedBirthDay ",parsedBirthDay);
      console.log("check updateUserDto.birth_day ",updateUserDto.birth_day);
      if (updateUserDto.birth_day) {
        parsedBirthDay = new Date(updateUserDto.birth_day);
        if (isNaN(parsedBirthDay.getTime())) {
          throw new ForbiddenException('Ngày sinh không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD');
        }
      }
      const updatedData: Prisma.UserUpdateInput = {
        ...user,
      name : updateUserDto.name? updateUserDto.name : user.name,
      phone : updateUserDto.phone? updateUserDto.phone : user.phone,    
      birth_day : parsedBirthDay? parsedBirthDay : user.birth_day,
      gender : updateUserDto.gender? updateUserDto.gender : user.gender,
      avatar : avatarUrl? avatarUrl : user.avatar,
      role : updateUserDto.role? updateUserDto.role : user.role

      };


     console.log("result",updatedData);
    
      // const updatedUser = await this.prisma.user.update({
      //   where: { user_id: userId },
      //   data: updatedData
      // });
    
      return {
        message: 'Thông tin người dùng đã được cập nhật thành công',
        data: updatedData
      };
      
    }
    private getPublicIdFromUrl(url: string): string {
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      return filename.split('.')[0];
    }
}



