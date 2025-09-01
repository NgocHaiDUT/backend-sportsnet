import { Controller, Get, Query, HttpException, HttpStatus, Param, ParseIntPipe, Post, Body, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { VideoService } from './video.service';

@Controller('video')
export class VideoController {
    constructor(
        private readonly videoService: VideoService
    ) {}

    @Get('first-two')
    async getFirstTwo() {
        try {
            const posts = await this.videoService.getFirstTwoVideoPosts();
            return { data: posts };
        } catch (error) {
            throw new HttpException('Failed to fetch video posts', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('random')
    async getRandom(
        @Query('excludeIds') excludeIds?: string,
        @Query('userId') userId?: string, // optional user id as query string
    ) {
        // parse excludeIds like "1,2,3" => [1,2,3]
        const excludeArray: number[] = Array.isArray(excludeIds)
            ? (excludeIds as unknown as string[])
                .join(',')
                .split(',')
                .map((s) => parseInt(s, 10))
                .filter((n) => !isNaN(n))
            : excludeIds
            ? excludeIds
                .split(',')
                .map((s) => parseInt(s, 10))
                .filter((n) => !isNaN(n))
            : [];

        const userIdNum = userId ? parseInt(userId, 10) : undefined;

        try {
            const post = await this.videoService.getRandomVideoPost(excludeArray, userIdNum);
            return { data: post };
        } catch (error) {
            throw new HttpException('Failed to fetch random video post', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // GET /video/:postId/comments
    @Get(':postId/comments')
    async getComments(
        @Param('postId', ParseIntPipe) postId: number,
    ) {
        try {
            const comments = await this.videoService.getCommentsByPost(postId);
            return { data: comments };
        } catch (error) {
            throw new HttpException('Failed to fetch comments', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // POST /video/:postId/comments  body: { userId, content, parentId? }
    @Post(':postId/comments')
    async createComment(
        @Param('postId', ParseIntPipe) postId: number,
        @Body('userId', ParseIntPipe) userId: number,
        @Body('content') content: string,
        @Body('parentId') parentId?: number,
    ) {
        try {
            const comment = await this.videoService.createComment(postId, userId, content, parentId);
            return { data: comment };
        } catch (error) {
            throw new HttpException('Failed to create comment', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // GET /video/:postId/liked?userId=123
    @Get(':postId/liked')
    async isPostLiked(
        @Param('postId', ParseIntPipe) postId: number,
        @Query('userId', ParseIntPipe) userId: number,
    ) {
        try {
            const liked = await this.videoService.isPostLikedByUser(postId, userId);
            return { liked };
        } catch (error) {
            throw new HttpException('Failed to check like', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // POST /video/:postId/like  body: { userId }
    @Post(':postId/like')
    async likePost(
        @Param('postId', ParseIntPipe) postId: number,
        @Body('userId', ParseIntPipe) userId: number,
    ) {
        try {
            const like = await this.videoService.createPostLike(postId, userId);
            return { data: like };
        } catch (error) {
            throw new HttpException('Failed to like post', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // DELETE /video/:postId/like?userId=123  -> unlike post
    @Delete(':postId/like')
    async unlikePost(
        @Param('postId', ParseIntPipe) postId: number,
        @Query('userId', ParseIntPipe) userId: number,
    ) {
        try {
            const res = await this.videoService.deletePostLike(postId, userId);
            return { data: res };
        } catch (error) {
            throw new HttpException('Failed to unlike post', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // POST /video/follow  body: { followerId, followingId }
    @Post('follow')
    async followUser(
        @Body('followerId', ParseIntPipe) followerId: number,
        @Body('followingId', ParseIntPipe) followingId: number,
    ) {
        try {
            const rel = await this.videoService.createFollow(followerId, followingId);
            return { data: rel };
        } catch (error) {
            throw new HttpException('Failed to follow', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // DELETE /video/follow?followerId=1&followingId=2  -> unfollow
    @Delete('follow')
    async unfollow(
        @Query('followerId', ParseIntPipe) followerId: number,
        @Query('followingId', ParseIntPipe) followingId: number,
    ) {
        try {
            const res = await this.videoService.deleteFollow(followerId, followingId);
            return { data: res };
        } catch (error) {
            throw new HttpException('Failed to unfollow', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // GET /video/:postId/liked-comments?userId=1
    @Get(':postId/liked-comments')
    async getLikedComments(
        @Param('postId', ParseIntPipe) postId: number,
        @Query('userId', ParseIntPipe) userId: number,
    ) {
        try {
            const likedComments = await this.videoService.getLikedCommentsByUserForPost(postId, userId);
            return { data: likedComments };
        } catch (error) {
            throw new HttpException('Failed to fetch liked comments', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // POST /video/comments/:commentId/like  body: { userId }
    @Post('comments/:commentId/like')
    async likeComment(
        @Param('commentId', ParseIntPipe) commentId: number,
        @Body('userId', ParseIntPipe) userId: number,
    ) {
        try {
            const like = await this.videoService.createCommentLike(commentId, userId);
            return { data: like };
        } catch (error) {
            throw new HttpException('Failed to like comment', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // DELETE /video/comments/:commentId/like?userId=123  -> unlike comment
    @Delete('comments/:commentId/like')
    async unlikeComment(
        @Param('commentId', ParseIntPipe) commentId: number,
        @Query('userId', ParseIntPipe) userId: number,
    ) {
        try {
            const res = await this.videoService.deleteCommentLike(commentId, userId);
            return { data: res };
        } catch (error) {
            throw new HttpException('Failed to unlike comment', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // GET /video/following?followerId=1&followingId=2
    @Get('following')
    async isFollowing(
        @Query('followerId', ParseIntPipe) followerId: number,
        @Query('followingId', ParseIntPipe) followingId: number,
    ) {
        try {
            const following = await this.videoService.isUserFollowing(followerId, followingId);
            return { following };
        } catch (error) {
            throw new HttpException('Failed to check following', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('video', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = 'uploads/videos';
                try {
                    fs.mkdirSync(uploadPath, { recursive: true });
                } catch (e) {
                    // ignore, mkdirSync may throw if already exists on some platforms
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const fileExt = extname(file.originalname) || '.mp4';
                cb(null, `${uniqueSuffix}${fileExt}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            const allowed = ['video/mp4'];
            if (!allowed.includes(file.mimetype)) {
                return cb(new HttpException('Only mp4 videos are allowed', HttpStatus.BAD_REQUEST), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit (adjust as needed)
    }))
    async uploadVideo(
        @Body('userId', ParseIntPipe) userId: number,
        @Body('title') title: string,
        @Body('content') content: string,
        @Body('mode') mode: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new HttpException('No video file uploaded', HttpStatus.BAD_REQUEST);
        }

        try {
            const post = await this.videoService.createVideoPost(userId, title, content, mode, file.path);
            return { data: post };
        } catch (error) {
            throw new HttpException('Failed to create video post', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // POST /video/block  body: { userId, blockedId }
    @Post('block')
    async blockUser(
        @Body('userId', ParseIntPipe) userId: number,
        @Body('blockedId', ParseIntPipe) blockedId: number,
    ) {
        try {
            const res = await this.videoService.createBlock(userId, blockedId);
            return { data: res };
        } catch (error) {
            throw new HttpException('Failed to block user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // DELETE /video/block?userId=1&blockedId=2  -> unblock
    @Delete('block')
    async unblockUser(
        @Query('userId', ParseIntPipe) userId: number,
        @Query('blockedId', ParseIntPipe) blockedId: number,
    ) {
        try {
            const res = await this.videoService.deleteBlock(userId, blockedId);
            return { data: res };
        } catch (error) {
            throw new HttpException('Failed to unblock user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // GET /video/search/posts?q=...&limit=20&userId=123
    @Get('search/posts')
    async searchPosts(
        @Query('q') q: string,
        @Query('limit') limit?: string,
        @Query('userId') userId?: string,
    ) {
        try {
            const lim = limit ? Math.max(1, Math.min(200, parseInt(limit, 10) || 50)) : 50;
            const requesterId = userId ? parseInt(userId, 10) : undefined;
            const results = await this.videoService.searchPosts(q, lim, requesterId);
            return { data: results };
        } catch (error) {
            throw new HttpException('Failed to search posts', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // GET /video/search/users?q=...&limit=20&userId=123
    @Get('search/users')
    async searchUsers(
        @Query('q') q: string,
        @Query('limit') limit?: string,
        @Query('userId') userId?: string,
    ) {
        try {
            const lim = limit ? Math.max(1, Math.min(200, parseInt(limit, 10) || 50)) : 50;
            const requesterId = userId ? parseInt(userId, 10) : undefined;
            const results = await this.videoService.searchUsers(q, lim, requesterId);
            return { data: results };
        } catch (error) {
            throw new HttpException('Failed to search users', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // GET /video/user/:targetUserId?userId=123
    @Get('user/:targetUserId')
    async getUserProfile(
        @Param('targetUserId', ParseIntPipe) targetUserId: number,
        @Query('userId') userId?: string,
    ) {
        try {
            const requesterId = userId ? parseInt(userId, 10) : undefined;
            const profile = await this.videoService.getUserProfile(targetUserId, requesterId);
            if (!profile) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }
            return { data: profile };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException('Failed to fetch user profile', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // POST /video/notification  body: { userId, title }
    @Post('notification')
    async createNotification(
        @Body('userId', ParseIntPipe) userId: number,
        @Body('title') title: string,
        @Body('actorId') actorId?: any,
    ) {
        try {
            // actorId may come as string (from JSON) or number; normalize to number|null
            let actorIdNum: number | undefined = undefined;
            if (actorId !== undefined && actorId !== null) {
                if (typeof actorId === 'string') {
                    const parsed = parseInt(actorId, 10);
                    if (!isNaN(parsed)) actorIdNum = parsed;
                } else if (typeof actorId === 'number') {
                    actorIdNum = actorId;
                }
            }

            const notification = await this.videoService.createNotification(userId, title, actorIdNum);
            return { data: notification };
        } catch (error) {
            console.error('Error creating notification:', error);
            if (error instanceof HttpException) throw error;
            throw new HttpException('Failed to create notification', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // DELETE /video/notification?userId=123&notificationId=456  -> delete a notification
    @Delete('notification')
    async deleteNotification(
        @Query('userId', ParseIntPipe) userId: number,
        @Query('notificationId', ParseIntPipe) notificationId: number,
    ) {
        try {
            const res = await this.videoService.deleteNotification(userId, notificationId);
            if (!res) {
                // not found or not owned
                throw new HttpException('Notification not found or not owned', HttpStatus.NOT_FOUND);
            }
            return { data: res };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException('Failed to delete notification', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // GET /video/notifications?userId=123&limit=50&unread=true
    @Get('notifications')
    async getNotifications(
        @Query('userId', ParseIntPipe) userId: number,
        @Query('limit') limit?: string,
        @Query('unread') unread?: string,
    ) {
        try {
            const lim = limit ? Math.max(1, Math.min(200, parseInt(limit, 10) || 50)) : 50;
            const unreadOnly = unread === 'true' || unread === '1';
            const notifs = await this.videoService.getNotificationsForUser(userId, lim, unreadOnly);
            return { data: notifs };
        } catch (error) {
            throw new HttpException('Failed to fetch notifications', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
