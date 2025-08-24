import { Controller,Post,Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VideoService } from './video.service';
@Controller('video')
export class VideoController {
    constructor(
        private readonly prismaService: PrismaService, 
        private readonly videoService: VideoService
    ) {}
}
