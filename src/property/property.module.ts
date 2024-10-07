import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { MulterModule } from '@nestjs/platform-express';


@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),

  ],
  controllers: [PropertyController],
  providers: [PropertyService],
})
export class PropertyModule {}
