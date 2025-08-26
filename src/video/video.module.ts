import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Thêm dòng này

@Module({
  imports: [PrismaModule], // Thêm dòng này
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}