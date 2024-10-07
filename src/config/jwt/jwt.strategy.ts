import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  // async validate(payload: any) {
  //   return { userId: payload.sub, username: payload.username };
  // }
  // async validate(payload: any): Promise<User> {
  //   console.log('Payload:', payload);  // Thêm dòng này để ghi log payload
  //   if (!payload.sub) {
  //     throw new Error('Invalid token payload: missing sub');
  //   }
  //   const user = await this.prismaService.user.findUnique({
  //     where: { user_id: payload.sub },
  //   });
  //   if (!user) {
  //     throw new Error('User not found');
  //   }
  //   return user;
  // }

  async validate(payload: any): Promise<User> {
    console.log('Payload in JwtStrategy:', JSON.stringify(payload, null, 2));
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid token payload: not an object');
    }
    if (!payload.sub) {
      throw new Error('Invalid token payload: missing sub');
    }
    const user = await this.prismaService.user.findUnique({
      where: { user_id: payload.sub },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}