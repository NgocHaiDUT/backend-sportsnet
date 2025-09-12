import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notification.gateway'; 
export enum NotificationType {
  LIKE_POST = 'like_post',
  COMMENT_POST = 'comment_post',
  LIKE_COMMENT = 'like_comment',
  REPLY_COMMENT = 'reply_comment',
  FOLLOW = 'follow',
  NEW_POST_FROM_FOLLOWING = 'new_post_from_following',
   NEW_BOOKING = 'new_booking',
}

export interface CreateNotificationDto {
  userId: number;
  actorId?: number; // ID của người thực hiện hành động
  type: NotificationType;
  title: string;
  isRead?: boolean;
  relatedPostId?: number;
  relatedCommentId?: number;
  relatedUserId?: number;
}

@Injectable()
export class NotificationService {
   constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(data: CreateNotificationDto) {
    try {
      const notification = await this.prismaService.notification.create({
        data: {
          User_id: data.userId,
          Actor_id: data.actorId,
          Title: data.title,
          Is_read: data.isRead || false,
          CreateAt: new Date(),
        },
      });

      return {
        success: true,
        message: 'Notification created successfully',
        data: notification,
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new BadRequestException('Failed to create notification: ' + error.message);
    }
  }

  async getUserNotifications(userId: number) {
    try {
      const notifications = await this.prismaService.notification.findMany({
        where: {
          User_id: userId,
        },
        include: {
          actor: {
            select: {
              Id: true,
              Fullname: true,
              User_name: true,
              Avatar: true,
            },
          },
        },
        orderBy: {
          CreateAt: 'desc',
        },
        take: 50, // Limit to 50 most recent notifications
      });

      return {
        success: true,
        data: notifications,
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw new BadRequestException('Failed to get notifications: ' + error.message);
    }
  }

  async markAsRead(notificationId: number, userId: number) {
    try {
      const notification = await this.prismaService.notification.findFirst({
        where: {
          Id: notificationId,
          User_id: userId,
        },
      });

      if (!notification) {
        throw new BadRequestException('Notification not found');
      }

      const updatedNotification = await this.prismaService.notification.update({
        where: {
          Id: notificationId,
        },
        data: {
          Is_read: true,
        },
      });

      return {
        success: true,
        message: 'Notification marked as read',
        data: updatedNotification,
      };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new BadRequestException('Failed to mark notification as read: ' + error.message);
    }
  }

  async markAllAsRead(userId: number) {
    try {
      await this.prismaService.notification.updateMany({
        where: {
          User_id: userId,
          Is_read: false,
        },
        data: {
          Is_read: true,
        },
      });

      return {
        success: true,
        message: 'All notifications marked as read',
      };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new BadRequestException('Failed to mark all notifications as read: ' + error.message);
    }
  }

  async getUnreadCount(userId: number) {
    try {
      const count = await this.prismaService.notification.count({
        where: {
          User_id: userId,
          Is_read: false,
        },
      });

      return {
        success: true,
        data: { count },
      };
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw new BadRequestException('Failed to get unread count: ' + error.message);
    }
  }

  // Helper methods for specific notification types
  async notifyLikePost(postId: number, likerUserId: number) {
    try {
      // Get post owner
      const post = await this.prismaService.post.findUnique({
        where: { Id: postId },
        include: {
          account: true,
        },
      });

      if (!post || post.User_id === likerUserId) {
        return; // Don't notify if post not found or user likes own post
      }

      // Get liker info
      const liker = await this.prismaService.account.findUnique({
        where: { Id: likerUserId },
      });

      if (!liker) return;

      await this.createNotification({
        userId: post.User_id,
        actorId: likerUserId,
        type: NotificationType.LIKE_POST,
        title: `${liker.Fullname} đã thích bài viết "${post.Title}"`,
      });
    } catch (error) {
      console.error('Error creating like post notification:', error);
    }
  }

  async notifyCommentPost(postId: number, commenterUserId: number) {
    try {
      // Get post owner
      const post = await this.prismaService.post.findUnique({
        where: { Id: postId },
        include: {
          account: true,
        },
      });

      if (!post || post.User_id === commenterUserId) {
        return; // Don't notify if post not found or user comments on own post
      }

      // Get commenter info
      const commenter = await this.prismaService.account.findUnique({
        where: { Id: commenterUserId },
      });

      if (!commenter) return;

      await this.createNotification({
        userId: post.User_id,
        actorId: commenterUserId,
        type: NotificationType.COMMENT_POST,
        title: `${commenter.Fullname} đã bình luận về bài viết "${post.Title}"`,
      });
    } catch (error) {
      console.error('Error creating comment post notification:', error);
    }
  }

  async notifyLikeComment(commentId: number, likerUserId: number) {
    try {
      // Get comment owner
      const comment = await this.prismaService.comment.findUnique({
        where: { Id: commentId },
        include: {
          account: true,
          post: true,
        },
      });

      if (!comment || comment.Id_account === likerUserId) {
        return; // Don't notify if comment not found or user likes own comment
      }

      // Get liker info
      const liker = await this.prismaService.account.findUnique({
        where: { Id: likerUserId },
      });

      if (!liker) return;

      await this.createNotification({
        userId: comment.Id_account,
        actorId: likerUserId,
        type: NotificationType.LIKE_COMMENT,
        title: `${liker.Fullname} đã thích bình luận của bạn về "${comment.post.Title}"`,
      });
    } catch (error) {
      console.error('Error creating like comment notification:', error);
    }
  }

  async notifyReplyComment(parentCommentId: number, replierUserId: number) {
    try {
      // Get parent comment owner
      const parentComment = await this.prismaService.comment.findUnique({
        where: { Id: parentCommentId },
        include: {
          account: true,
          post: true,
        },
      });

      if (!parentComment || parentComment.Id_account === replierUserId) {
        return; // Don't notify if comment not found or user replies to own comment
      }

      // Get replier info
      const replier = await this.prismaService.account.findUnique({
        where: { Id: replierUserId },
      });

      if (!replier) return;

      await this.createNotification({
        userId: parentComment.Id_account,
        actorId: replierUserId,
        type: NotificationType.REPLY_COMMENT,
        title: `${replier.Fullname} đã trả lời bình luận của bạn về "${parentComment.post.Title}"`,
      });
    } catch (error) {
      console.error('Error creating reply comment notification:', error);
    }
  }

  async notifyFollow(followedUserId: number, followerUserId: number) {
    try {
      if (followedUserId === followerUserId) {
        return; // Don't notify if user follows themselves
      }

      // Get follower info
      const follower = await this.prismaService.account.findUnique({
        where: { Id: followerUserId },
      });

      if (!follower) return;

      await this.createNotification({
        userId: followedUserId,
        actorId: followerUserId,
        type: NotificationType.FOLLOW,
        title: `${follower.Fullname} đã theo dõi bạn`,
      });
    } catch (error) {
      console.error('Error creating follow notification:', error);
    }
  }

  async notifyNewPostFromFollowing(postId: number, authorUserId: number) {
    try {
      // Get all followers of the author
      const followers = await this.prismaService.follow.findMany({
        where: {
          Following_id: authorUserId,
        },
        include: {
          follower: true,
        },
      });

      // Get post info
      const post = await this.prismaService.post.findUnique({
        where: { Id: postId },
        include: {
          account: true,
        },
      });

      if (!post) return;

      // Create notifications for all followers
      const notificationPromises = followers.map(follow =>
        this.createNotification({
          userId: follow.Follower_id,
          actorId: authorUserId,
          type: NotificationType.NEW_POST_FROM_FOLLOWING,
          title: `${post.account.Fullname} đã đăng bài viết mới: "${post.Title}"`,
        })
      );

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Error creating new post notifications:', error);
    }
    
  }
  async notifyNewBooking(
    ownerId: number,
    actorId: number,
    actorName: string,
    bookingId: number,
    details: { courtName: string, sportFieldName: string, startTime: string }
  ) {
    try {
      const title = `${actorName} vừa đặt ${details.courtName} tại ${details.sportFieldName} lúc ${details.startTime}.`;
      
      const notification = await this.prismaService.notification.create({
        data: {
          User_id: ownerId,
          Actor_id: actorId,
          Title: title,
          bookingId: bookingId, // Liên kết tới booking
          Is_read: false,
        },
      });

      // Gửi thông báo real-time qua Gateway
      this.notificationsGateway.sendNotificationToUser(ownerId, notification);

    } catch (error) {
      console.error('Error creating new booking notification:', error);
    }
  }

  async notifyBookingCreatedForUser(
    userId: number,
    bookingId: number,
    details: {
      courtName: string;
      sportFieldName: string;
      date: string;
      startTime: string;
      endTime: string;
      totalPrice: number;
      status: string;
    },
  ) {
    try {
      const title = `Bạn đã đặt ${details.courtName} tại ${details.sportFieldName} ngày ${details.date} ${details.startTime}-${details.endTime}. Tổng: ${details.totalPrice.toLocaleString('vi-VN')}₫ • Trạng thái: ${details.status}`;

      const notification = await this.prismaService.notification.create({
        data: {
          User_id: userId,
          Title: title,
          bookingId: bookingId,
          Is_read: false,
          CreateAt: new Date(),
        },
      });

      this.notificationsGateway.sendNotificationToUser(userId, notification);
    } catch (error) {
      console.error('Error creating booking-created-for-user notification:', error);
    }
  }

  async notifyBookingStatusUpdate(
    recipientId: number,
    actorId: number,
    bookingId: number,
    details: {
      sportFieldName: string;
      startTime: string; // Đã được format sẵn, ví dụ: "20:00 20/10/2025"
      newStatus: 'CONFIRMED' | 'REJECTED' | 'PENDING' | string;
    },
  ) {
    try {
      let title = '';

      // Tùy chỉnh nội dung thông báo dựa trên trạng thái mới
      switch (details.newStatus) {
        case 'CONFIRMED':
          title = `✅ Lịch đặt tại ${details.sportFieldName} lúc ${details.startTime} đã được xác nhận!`;
          break;
        case 'REJECTED':
          title = `❌ Lịch đặt tại ${details.sportFieldName} lúc ${details.startTime} đã bị từ chối.`;
          break;
        // Nếu bạn muốn thông báo cho các trạng thái khác, có thể thêm case ở đây.
        // Mặc định, chúng ta sẽ không gửi thông báo cho các trạng thái không quan trọng.
        default:
          return; 
      }

      // Tạo thông báo trong database
      const notification = await this.prismaService.notification.create({
        data: {
          User_id: recipientId,
          Actor_id: actorId,
          Title: title,
          bookingId: bookingId, // Liên kết tới booking
          Is_read: false,
          CreateAt: new Date(),
        },
      });

      // Gửi thông báo real-time qua Gateway tới người dùng
      this.notificationsGateway.sendNotificationToUser(recipientId, notification);

    } catch (error) {
      console.error('Error creating booking status update notification:', error);
    }
  }
}