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

    async getFollowers(userId: number) {
        try {
            // Get all followers of the user
            const followers = await this.prismaService.follow.findMany({
                where: { Following_id: Number(userId) },
                include: {
                    follower: {
                        select: {
                            Id: true,
                            Fullname: true,
                            User_name: true,
                            Avatar: true,
                        }
                    }
                }
            });

            // Transform the result to match frontend expectations
            const result = followers.map(follow => ({
                Id: follow.follower.Id,
                Fullname: follow.follower.Fullname,
                User_name: follow.follower.User_name,
                Avatar: follow.follower.Avatar,
            }));

            return result;
        } catch (error) {
            console.error('Error getting followers:', error);
            return { success: false, message: 'Error getting followers' };
        }
    }

    async getFollowing(userId: number) {
        try {
            // Get all users that the user is following
            const following = await this.prismaService.follow.findMany({
                where: { Follower_id: Number(userId) },
                include: {
                    following: {
                        select: {
                            Id: true,
                            Fullname: true,
                            User_name: true,
                            Avatar: true,
                        }
                    }
                }
            });

            // Transform the result to match frontend expectations
            const result = following.map(follow => ({
                Id: follow.following.Id,
                Fullname: follow.following.Fullname,
                User_name: follow.following.User_name,
                Avatar: follow.following.Avatar,
            }));

            return result;
        } catch (error) {
            console.error('Error getting following:', error);
            return { success: false, message: 'Error getting following' };
        }
    }

    async followUser(followerId: number, followingId: number) {
        try {
            // Prevent self-follow
            if (followerId === followingId) {
                return { success: false, message: 'Cannot follow yourself' };
            }

            // Check if users exist
            const follower = await this.prismaService.account.findUnique({
                where: { Id: Number(followerId) }
            });
            const following = await this.prismaService.account.findUnique({
                where: { Id: Number(followingId) }
            });

            if (!follower || !following) {
                return { success: false, message: 'User not found' };
            }

            // Check if the follow relationship already exists
            const existingFollow = await this.prismaService.follow.findFirst({
                where: {
                    Follower_id: Number(followerId),
                    Following_id: Number(followingId)
                }
            });

            if (existingFollow) {
                // Đã follow rồi, trả về success với message thông báo
                return { success: true, message: 'Already following this user', isFollowing: true };
            }

            // Create follow relationship
            await this.prismaService.follow.create({
                data: {
                    Follower_id: Number(followerId),
                    Following_id: Number(followingId),
                    CreatedAt: new Date()
                }
            });

            return { success: true, message: 'Successfully followed user', isFollowing: true };
        } catch (error) {
            console.error('Error following user:', error);
            return { success: false, message: 'Error following user' };
        }
    }

    async unfollowUser(followerId: number, followingId: number) {
        try {
            // Check if the follow relationship exists
            const existingFollow = await this.prismaService.follow.findFirst({
                where: {
                    Follower_id: Number(followerId),
                    Following_id: Number(followingId)
                }
            });

            if (!existingFollow) {
                // Chưa follow, trả về success với message thông báo
                return { success: true, message: 'Not following this user', isFollowing: false };
            }

            // Delete follow relationship
            await this.prismaService.follow.delete({
                where: {
                    Id: existingFollow.Id
                }
            });

            return { success: true, message: 'Successfully unfollowed user', isFollowing: false };
        } catch (error) {
            console.error('Error unfollowing user:', error);
            return { success: false, message: 'Error unfollowing user' };
        }
    }

    async checkFollowStatus(followerId: number, followingId: number) {
        try {
            const followRelation = await this.prismaService.follow.findFirst({
                where: {
                    Follower_id: Number(followerId),
                    Following_id: Number(followingId)
                }
            });

            return { 
                success: true, 
                isFollowing: !!followRelation,
                data: { isFollowing: !!followRelation }
            };
        } catch (error) {
            console.error('Error checking follow status:', error);
            return { success: false, message: 'Error checking follow status' };
        }
    }

}
