import { BadRequestException, Injectable } from '@nestjs/common';
import { Login } from './auth.type';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Gender, Role, User } from 'src/user/user.types';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from 'src/config/cloundinary/cloudinary.service';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class AuthService {
  constructor(
        private prisma: PrismaService, 
        private jwtService: JwtService, 
        private cloudinaryService: CloudinaryService,
        private configService : ConfigService
      ) {}


        async signup(body: User, file: Express.Multer.File) {
            const { email, name, password, phone, birth_day, gender } = body;
          
            // check exist email
            const checkEmail = await this.prisma.user.findUnique({
              where: { email: email }
            });
            if (checkEmail) {
              throw new BadRequestException('Email already exists');
            }
          
            // hash password
            const hashedPassword = await bcrypt.hash(password, 10);
          
            let avatarUrl = null;
            if (file) {
              try {
                const result = await this.cloudinaryService.uploadImage(file);
                avatarUrl = result.secure_url;
              } catch (error) {
                console.error('Error uploading file to Cloudinary:', error);
                // Bạn có thể quyết định xử lý lỗi này như thế nào, ví dụ:
                // throw new BadRequestException('Failed to upload avatar');
              }
            }

            // Xử lý ngày sinh
        let parsedBirthDay: Date | null = null;
        if (birth_day) {
          parsedBirthDay = new Date(birth_day);
          if (isNaN(parsedBirthDay.getTime())) {
            throw new BadRequestException('Invalid birth date format. Please use YYYY-MM-DD');
          }
        }
          
            const data = {
              email,
              name,
              password: hashedPassword,
              phone: phone || null,
              birth_day: parsedBirthDay,
              gender: gender as Gender,
              role: Role.Guest,
              avatar: avatarUrl
            };
          
            // Tạo user mới trong database
            const newUser = await this.prisma.user.create({ data });
          
            return { message: "Signup successfully", content: data };
          }

          async login(body: Login) {
            const { email, password } = body;
            const user = await this.prisma.user.findUnique({
                where: { email: email }
            });

            if (!user) {
                throw new BadRequestException('Email is incorrect');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new BadRequestException('Password is incorrect');
            }

            console.log('User ID:', user.user_id);
            const payload = { sub: user.user_id, email: user.email };
            const token = await this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: '1h'
            });
            console.log('Generated token payload:', payload);
            console.log('Generated token:', token);

            return {
              message: 'Login successfully',
              access_token: token
            };
       
    }
  }
