import { Module } from '@nestjs/common';
import { SportFieldService } from './sport-field.service';
import { SportFieldController } from './sport-field.controller';
import { PrismaModule } from '../prisma/prisma.module'; // 1. Import PrismaModule

@Module({
  imports: [PrismaModule],
  controllers: [SportFieldController],
  providers: [SportFieldService],
})
export class SportFieldModule {}
