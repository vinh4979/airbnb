import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Login } from './auth.type';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/user/user.types';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/util/multer-config';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  // signup
  @Post('signup')
  @ApiOperation({ summary: 'User register' })
  @UseInterceptors(FileInterceptor('avatar', multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody({type: User})
  async signup(@Body() body: User, @UploadedFile() file: Express.Multer.File) {
    return this.authService.signup(body, file);
  }

  // login
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: Login })
  @ApiResponse({ status: 200, description: 'Login successful', schema: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Login successful' },
      access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
    }
  }})
  async login(@Body() body: Login): Promise<any | null> {
    const result = await this.authService.login(body);
    console.log('Login result:', JSON.stringify(result, null, 2));
    return result;
  }  
}

