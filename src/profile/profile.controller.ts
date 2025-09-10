
import { Controller, UseInterceptors, UploadedFile, Post, Body, Get, Param, Query } from '@nestjs/common';

import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../prisma/prisma.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as bcrypt from 'bcrypt';
import { ProfileService } from './profile.service';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
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

  @Post('update-phone')
  async updatePhone(@Body() updatePhoneDto: { userId: number; phone: string }) {
    if (updatePhoneDto.phone) {
      return this.profileService.updatePhone(updatePhoneDto.userId, updatePhoneDto.phone);
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

  @Post('upload-qr-payment')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dir = './uploads/qr-payments';
          if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async uploadQrPayment(
    @Body('userId') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const qrUrl = `/uploads/qr-payments/${file.filename}`;
    return this.profileService.updateQrPayment(userId, qrUrl);
  }

  @Get('followers/:userId')
  async getFollowers(@Param('userId') userId: string) {
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return { success: false, message: 'Invalid user ID' };
    }
    return this.profileService.getFollowers(userIdNum);
  }

  @Get('following/:userId')
  async getFollowing(@Param('userId') userId: string) {
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return { success: false, message: 'Invalid user ID' };
    }
    return this.profileService.getFollowing(userIdNum);
  }

  @Post('follow')
  async followUser(@Body() followDto: { followerId: number; followingId: number }) {
    if (!followDto.followerId || !followDto.followingId) {
      return { success: false, message: 'Invalid data' };
    }
    return this.profileService.followUser(followDto.followerId, followDto.followingId);
  }

  @Post('unfollow')
  async unfollowUser(@Body() unfollowDto: { followerId: number; followingId: number }) {
    if (!unfollowDto.followerId || !unfollowDto.followingId) {
      return { success: false, message: 'Invalid data' };
    }
    return this.profileService.unfollowUser(unfollowDto.followerId, unfollowDto.followingId);
  }

  @Get('check-follow/:followerId/:followingId')
  async checkFollowStatus(@Param('followerId') followerId: string, @Param('followingId') followingId: string) {
    const followerIdNum = parseInt(followerId);
    const followingIdNum = parseInt(followingId);
    if (isNaN(followerIdNum) || isNaN(followingIdNum)) {
      return { success: false, message: 'Invalid user IDs' };
    }
    return this.profileService.checkFollowStatus(followerIdNum, followingIdNum);
  }
  @Get('getnumberfollow')
  async getnumberfollow(@Query('userId') userId: String ){
    if(userId){
      return this.profileService.getnumberfollow(Number(userId));
    }
    else false
  }

  @Get('bookings')
  async getBookingsByUser(@Query('userId') userId: string) {
    const id = Number(userId);
    if (!id) return { success: false, message: 'Invalid user ID' };
    return this.profileService.getbookingbyuser(id);
  }

  @Get('booking-detail')
  async getBookingDetail(@Query('userId') userId: string, @Query('bookingId') bookingId: string) {
    const uid = Number(userId);
    const bid = Number(bookingId);
    if (!uid || !bid) return { success: false, message: 'Invalid params' };
    return this.profileService.getBookingDetail(uid, bid);
  }

  // Update VietQR settings (OWNER only)
  @Post('vietqr/update')
  async updateVietqr(
    @Body() body: {
      userId: number;
      vietqr_bank_code?: string;
      vietqr_account_number?: string;
      vietqr_account_name?: string;
      vietqr_is_enabled?: boolean;
      vietqr_addinfo_prefix?: string;
    },
  ) {
    const uid = Number(body.userId);
    if (!uid) return { success: false, message: 'Invalid userId' };
    return this.profileService.updateVietqrSettings(uid, body);
  }

  // Get VietQR settings (OWNER only)
  @Get('vietqr/settings')
  async getVietqr(@Query('userId') userId: string) {
    const uid = Number(userId);
    if (!uid) return { success: false, message: 'Invalid userId' };
    return this.profileService.getVietqrSettings(uid);
  }

}
