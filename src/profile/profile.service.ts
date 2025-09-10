import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { join } from 'path';
import { promises as fs } from 'fs';
@Injectable()
export class ProfileService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly notificationService: NotificationService
    ) {}

    // Format date to "dd/MM/yyyy HH:mm" in Vietnam timezone
    private formatVNDateTime(date: Date): string {
        const tz = 'Asia/Ho_Chi_Minh';
        const d = new Date(date);
        const datePart = new Intl.DateTimeFormat('vi-VN', {
            timeZone: tz,
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(d);
        const timePart = new Intl.DateTimeFormat('vi-VN', {
            timeZone: tz,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(d);
        return `${datePart} ${timePart}`;
    }

    // Format only date dd/MM/yyyy in Vietnam timezone
    private formatVNDate(date: Date): string {
        const tz = 'Asia/Ho_Chi_Minh';
        return new Intl.DateTimeFormat('vi-VN', {
            timeZone: tz,
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(new Date(date));
    }

    // Format only time HH:mm in Vietnam timezone
    private formatVNTime(date: Date): string {
        const tz = 'Asia/Ho_Chi_Minh';
        return new Intl.DateTimeFormat('vi-VN', {
            timeZone: tz,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(new Date(date));
    }

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

    async updatePhone(userId: number, phone: string) {
        const user = await this.prismaService.account.findUnique({
            where: { Id: Number(userId) },
        });
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        await this.prismaService.account.update({
            where: { Id: Number(userId) },
            data: { phone: phone },
        });
        return { success: true, message: 'Phone updated successfully', phone };
    }

    async updateQrPayment(userId: number, qrUrl: string) {
        const user = await this.prismaService.account.findUnique({
            where: { Id: Number(userId) },
        });
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        if (user.Role !== 'OWNER') {
            return { success: false, message: 'Only OWNER can set QR payment' };
        }
        await this.prismaService.account.update({
            where: { Id: Number(userId) },
            data: { QR_Payment: qrUrl },
        });
        return { success: true, message: 'QR payment updated successfully', qrUrl };
    }

    async updateVietqrSettings(
        userId: number,
        payload: {
            vietqr_bank_code?: string;
            vietqr_account_number?: string;
            vietqr_account_name?: string;
            vietqr_is_enabled?: boolean;
            vietqr_addinfo_prefix?: string;
        },
    ) {
        const user = await this.prismaService.account.findUnique({ where: { Id: Number(userId) } });
        if (!user) return { success: false, message: 'User not found' };
        if (user.Role !== 'OWNER') return { success: false, message: 'Only OWNER can update VietQR settings' };

        const updateData: any = {};
        if (payload.vietqr_bank_code !== undefined) updateData.vietqr_bank_code = payload.vietqr_bank_code;
        if (payload.vietqr_account_number !== undefined) updateData.vietqr_account_number = payload.vietqr_account_number;
        if (payload.vietqr_account_name !== undefined) updateData.vietqr_account_name = payload.vietqr_account_name;
        if (payload.vietqr_is_enabled !== undefined) updateData.vietqr_is_enabled = payload.vietqr_is_enabled;
        if (payload.vietqr_addinfo_prefix !== undefined) updateData.vietqr_addinfo_prefix = payload.vietqr_addinfo_prefix;

        if (Object.keys(updateData).length === 0) {
            return { success: false, message: 'No fields to update' };
        }

        await this.prismaService.account.update({ where: { Id: Number(userId) }, data: updateData });
        return { success: true, message: 'VietQR settings updated successfully' };
    }

    async getVietqrSettings(userId: number) {
        const user = await this.prismaService.account.findUnique({
            where: { Id: Number(userId) },
            select: {
                Id: true,
                Role: true,
                vietqr_bank_code: true,
                vietqr_account_number: true,
                vietqr_account_name: true,
                vietqr_is_enabled: true,
                vietqr_addinfo_prefix: true,
                vietqr_template: true,
                QR_Payment: true,
            },
        });
        if (!user) return { success: false, message: 'User not found' };
        if (user.Role !== 'OWNER') return { success: false, message: 'Only OWNER supports VietQR settings' };
        const { Role, ...rest } = user as any;
        return { success: true, data: rest };
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
                        },
                    },
                },
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

            // ✅ Send notification to the followed user
            await this.notificationService.notifyFollow(Number(followingId), Number(followerId));

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

    async getnumberfollow(userId : number) {
        const numberfollower = await this.prismaService.follow.count ({
            where : { Following_id : userId},

        })
        const numberfollowing = await this.prismaService.follow.count ({
            where : { Follower_id : userId}
        })

        return { numberfollower , numberfollowing }
    }

    async getbookingbyuser(userId: number) {
        const bookings = await this.prismaService.booking.findMany({
            where: { User_id: Number(userId) },
            include: {
                bookingSlots: {
                    select: {
                        startTime: true,
                        court: {
                            select: {
                                sportField: { select: { name: true } },
                            },
                        },
                    },
                    orderBy: { startTime: 'asc' },
                    take: 1,
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return bookings.map(b => {
            const firstSlot = b.bookingSlots[0];
            return {
                id: b.id,
                date: this.formatVNDateTime(b.createdAt as unknown as Date),
                totalPrice: b.totalPrice,
                status: b.status, // trạng thái thanh toán
                fieldName: firstSlot?.court?.sportField?.name ?? null,
            };
        });
    }

    // Lấy chi tiết 1 booking cho user: trạng thái, mã booking, tên & địa chỉ sân, email chủ sân, các slot (ngày, giờ bắt đầu/kết thúc), tổng giờ, tổng tiền
    async getBookingDetail(userId: number, bookingId: number) {
        const booking = await this.prismaService.booking.findFirst({
            where: { id: Number(bookingId), User_id: Number(userId) },
            include: {
                bookingSlots: {
                    include: {
                        court: {
                            include: {
                                sportField: true,
                            },
                        },
                    },
                    orderBy: { startTime: 'asc' },
                },
            },
        });

        if (!booking) return null;

        const firstSlot = booking.bookingSlots[0];
        const sportField = firstSlot?.court?.sportField as any;

        let ownerEmail: string | null = null;
        if (sportField?.ownerId) {
            const owner = await this.prismaService.account.findUnique({
                where: { Id: sportField.ownerId },
                select: { Email: true },
            });
            ownerEmail = owner?.Email ?? null;
        }

        const totalHours = booking.bookingSlots.reduce((sum, s) => {
            const diffMs = new Date(s.endTime).getTime() - new Date(s.startTime).getTime();
            return sum + Math.max(0, diffMs / (1000 * 60 * 60));
        }, 0);

        const slots = booking.bookingSlots.map(s => ({
            date: this.formatVNDate(s.startTime as unknown as Date),
            startTime: this.formatVNTime(s.startTime as unknown as Date),
            endTime: this.formatVNTime(s.endTime as unknown as Date),
            courtName: (s as any).court?.name ?? null,
        }));

        return {
            status: booking.status,
            bookingId: booking.id,
            fieldName: sportField?.name ?? null,
            fieldAddress: sportField?.address ?? null,
            paymentProof: booking.paymentProof ?? null,
            ownerEmail,
            note : booking.note,
            slots,
            totalHours,
            totalPrice: booking.totalPrice,
        };
    }

    
    

}