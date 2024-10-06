import { Controller, Get, Param, Query, NotFoundException, UseGuards, Put, UseInterceptors, Body, UploadedFile, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { Gender, Role, UpdateUserDto, User } from './user.types';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/multer-config';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: 'Get list of users' })
  @ApiResponse({ status: 200, description: 'Get list of users successfully' })
  async getAllUsers(): Promise<User[]> {
    const users = await this.userService.getAllUsers();
    return users.map(user => ({
      ...user,
      gender: user.gender as Gender,
      role: user.role as Role
    }));
  }

  @Get('search-user-by-name')
  @ApiOperation({ summary: 'Search users by name' })
  @ApiResponse({ status: 200, description: 'Search users successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async searchUsers(@Query('name') name: string): Promise<User[]> {
    const users = await this.userService.searchUsers(name);
    return users.map(user => ({
      ...user,
      gender: user.gender as Gender,
      role: user.role as Role
    }));
  }

  @Get('search-user-by-email')
  @ApiOperation({ summary: 'Search users by email' })
  @ApiResponse({ status: 200, description: 'Search users successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async searchUsersByEmail(@Query('email') email: string): Promise<User[]> {
    const users = await this.userService.searchUsersByEmail(email);
    return users.map(user => ({
      ...user,  
      gender: user.gender as Gender,
      role: user.role as Role
    }));
  } 

  @Get(':id')
  @ApiOperation({ summary: 'Get user information by id' })
  @ApiResponse({ status: 200, description: 'Get user information successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string): Promise<User> {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found with this id');
    }
    return {
      ...user,
      gender: user.gender as Gender,
      role: user.role as Role
    };
  }

@Put(':id')
@UseInterceptors(FileInterceptor('avatar', multerOptions))
@ApiConsumes('multipart/form-data')
@ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
@ApiResponse({ status: 200, description: 'Thông tin người dùng đã được cập nhật thành công' })
async updateUser(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateUserDto: UpdateUserDto,
  @UploadedFile() file: Express.Multer.File
) {
  return this.userService.updateUser(id, updateUserDto, file);
}

  
}



