import { ApiProperty } from "@nestjs/swagger";


  export class Login {
    @ApiProperty({ example: 'user@example.com', description: 'User email' })
    email: string;
  
    @ApiProperty({ example: 'password123', description: 'User password' })
    password: string;
  }

  