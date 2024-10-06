
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDate, IsNumber } from 'class-validator';

export enum Gender {
    male = 'male',
    female = 'female',
    other = 'other'
}
  
export enum Role {
    Guest = 'guest',
    Host = 'host',
    Admin = 'admin'
}
  
export class User {
    // @ApiProperty({ example: 1, description: 'User ID' })
    // user_id: number;

    @ApiProperty({ example: 'John Doe', description: 'User name' })
    name: string;

    @ApiProperty({ example: 'john.doe@example.com', description: 'User email' })
    email: string;

    @ApiProperty({ example: 'password123', description: 'User password' })
    password: string;

    @ApiProperty({ example: '0987654321', description: 'User phone number', required: false })
    phone?: string;

    @ApiProperty({ example: '1990-01-01', description: 'User birth date', required: false })
    birth_day?: Date;   

    @ApiProperty({ enum: Gender, description: 'User gender' })
    gender: Gender;

    @ApiProperty({ enum: Role, description: 'User role' })
    role: Role;
    
    @ApiProperty({ type: 'string', format: 'binary', required: false })
    avatar?: string;
}



export class UpdateUserDto {


  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  birth_day?: Date;

  @ApiProperty({ required: false, enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ required: false, enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
avatar?: any;
}
