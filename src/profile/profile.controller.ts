import { Controller,UseInterceptors, UploadedFile, Post,Body } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../prisma/prisma.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as bcrypt from 'bcrypt';
import { ProfileService } from './profile.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly mailerService: MailerService,
    private readonly prismaService: PrismaService,
  ) {}
  @Post('update-fullname')
  async updateFullName(@Body() updateFullNameDto: { fullName: string; userId: number }) {
    if(updateFullNameDto.fullName) {
      return this.profileService.updateFullName(updateFullNameDto.fullName, updateFullNameDto.userId);
    }
    return { success: false, message: 'Invalid data' };
  }

  @Post('update-password')
  async updatePassword(@Body() updatePasswordDto: { userId: number; oldPassword: string; newPassword: string }) {
    if (updatePasswordDto.oldPassword && updatePasswordDto.newPassword) {
      return this.profileService.updatePassword(
        updatePasswordDto.userId,
        updatePasswordDto.oldPassword,
        updatePasswordDto.newPassword,
      );
    }
    return { success: false, message: 'Invalid data' };
  }

  @Post('update-story')
  async updateStory(@Body() updateStoryDto: { userId: number; story: string }) {
    if (updateStoryDto.story) {
      return this.profileService.updateStory(updateStoryDto.userId, updateStoryDto.story);
    }
    return { success: false, message: 'Invalid data' };
  }

  @Post('upload-avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async uploadAvatar(
    @Body('userId') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.profileService.updateAvatar(userId, avatarUrl);
  }

}
