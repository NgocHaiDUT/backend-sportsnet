import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { join } from 'path';
import { promises as fs } from 'fs';
@Injectable()
export class ProfileService {
    constructor(private readonly prismaService: PrismaService) {}

    async updateFullName( fullName: string,userId: number ) {
        const user = await this.prismaService.account.findUnique({
          where: { Id : Number(userId) },
        });
    
        if (!user) {
          return { success: false, message: 'User not found' };
        }
        const updatedUser = await this.prismaService.account.update({
          where: { Id: Number(userId) },
          data: { Fullname: fullName },
        });
        return { success: true, message: 'Username updated successfully' };
    }
    async updatePassword(userId: number, oldPassword: string, newPassword: string) {
        const user = await this.prismaService.account.findUnique({
            where: { Id: Number(userId) },
        });

        if (!user || !(await bcrypt.compare(oldPassword, user.Password))) {
            return { success: false, message: 'Invalid old password' };
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await this.prismaService.account.update({
            where: { Id: Number(userId) },
            data: { Password: hashedNewPassword },
        });

        return { success: true, message: 'Password updated successfully' };
    }

    async updateStory(userId: number, story: string) {
        const user = await this.prismaService.account.findUnique({
            where: { Id: Number(userId) },
        });

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        await this.prismaService.account.update({
            where: { Id: Number(userId) },
            data: { Story: story },
        });

        return { success: true, message: 'Story updated successfully' };
    }

    async updateAvatar(userId: number, avatarUrl: string) {
        const user = await this.prismaService.account.findUnique({
            where: { Id: Number(userId) },
        });

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        await this.prismaService.account.update({
            where: { Id: Number(userId) },
            data: { Avatar: avatarUrl },
        });

        return { success: true, message: 'Avatar updated successfully', avatarUrl };
    }

    async getnumberfollow(userId : number) {
        const numberfollower = await this.prismaService.follow.count ({
            where : { Following_id : userId},

        })
        const numberfollowing = await this.prismaService.follow.count ({
            where : { Follower_id : userId}
        })

        return { numberfollower , numberfollowing }
    }
}
