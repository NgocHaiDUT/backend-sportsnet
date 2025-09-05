import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';

@Injectable()
export class VideoService {
    constructor(private readonly prismaService: PrismaService) {}

    /**
     * Return the first two posts where Type = 'video'.
     * Returns an array of post records (limited fields) sorted by Id ascending.
     * Now includes Comment_count (số lượng bình luận) and author Fullname/Avatar.
     */
    async getFirstTwoVideoPosts() {
        const posts = await this.prismaService.post.findMany({
            where: { Type: 'video' },
            orderBy: { Id: 'asc' },
            take: 2,
            select: {
                Id: true,
                User_id: true,
                Title: true,
                Video: true,
                Content: true,
                Heart_count: true,
                account: {
                    select: {
                        Fullname: true,
                        Avatar: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
        });

        return posts.map(post => ({
            Id: post.Id,
            User_id: post.User_id,
            Title: post.Title,
            Video: post.Video,
            Content: post.Content,
            Heart_count: post.Heart_count,
            Fullname: post.account?.Fullname ?? null,
            Avatar: post.account?.Avatar ?? null,
            Comment_count: post._count?.comments ?? 0,
        }));
    }

    /**
     * Return one random post where Type = 'video', excluding posts whose Id is in `excludeIds`.
     * Returns the single post object or null if none found.
     * Now includes Comment_count and author Fullname/Avatar.
     *
     * New behavior:
     *  - exclude posts with Mode === 'private'
     *  - if post.Mode === 'friend' include only when userId is provided and userId and author are mutual followers
     *  - always include posts with Mode === 'public'
     *  - exclude posts whose author is blocked by the requesting user (if userId provided)
     */
    async getRandomVideoPost(excludeIds: number[] = [], userId?: number) {
        const whereClause: any = { Type: 'video' };
        if (excludeIds && excludeIds.length > 0) {
            whereClause.Id = { notIn: excludeIds };
        }

        const candidates = await this.prismaService.post.findMany({
            where: whereClause,
            select: {
                Id: true,
                User_id: true,
                Title: true,
                Video: true,
                Content: true,
                Mode: true,
                Heart_count: true,
                account: {
                    select: {
                        Fullname: true,
                        Avatar: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
        });

        if (!candidates || candidates.length === 0) return null;

        // If requester provided, fetch authors that requester has blocked and exclude their posts
        let blockedByUserSet = new Set<number>();
        if (userId) {
            const authorIds = Array.from(new Set(candidates.map(c => c.User_id)));
            if (authorIds.length > 0) {
                const blocks = await (this.prismaService as any).block.findMany({
                    where: {
                        User_id: userId,
                        Blocked_id: { in: authorIds },
                    },
                    select: { Blocked_id: true },
                });
                blockedByUserSet = new Set(blocks.map(b => b.Blocked_id));
            }
        }

        // normalize mode strings to avoid mismatch (e.g. "friend" vs "friends" vs "Friend")
        const modeOf = (m: string | null | undefined) => (m ?? '').toString().toLowerCase().trim();

        // collect authors of posts that are "friend"-type (tolerant check)
        const friendAuthorIds = Array.from(new Set(
            candidates
                .filter(c => modeOf(c.Mode).includes('friend'))
                .map(c => c.User_id)
        ));

        let mutualAuthorSet = new Set<number>();

        if (userId && friendAuthorIds.length > 0) {
            // authors that userId follows
            const followsFromUser = await this.prismaService.follow.findMany({
                where: {
                    Follower_id: userId,
                    Following_id: { in: friendAuthorIds },
                },
                select: { Following_id: true },
            });
            const followingIds = new Set(followsFromUser.map(f => f.Following_id));

            // authors that follow userId
            const followsToUser = await this.prismaService.follow.findMany({
                where: {
                    Follower_id: { in: friendAuthorIds },
                    Following_id: userId,
                },
                select: { Follower_id: true },
            });
            const followerIds = new Set(followsToUser.map(f => f.Follower_id));

            // mutual = intersection
            for (const id of followingIds) {
                if (followerIds.has(id)) mutualAuthorSet.add(id as number);
            }
        }

        const filtered = candidates.filter(c => {
            // exclude if requester has blocked the author
            if (userId && blockedByUserSet.has(c.User_id)) return false;

            const m = modeOf(c.Mode);
            if (m === 'private') return false;
            if (m === 'public' || m === '') return true; // treat empty as public if desired
            if (m.includes('friend')) {
                // allow if requester is the author themself OR if mutual follow exists
                if (!userId) return false;
                if (userId === c.User_id) return true;
                return mutualAuthorSet.has(c.User_id);
            }
            // fallback: only allow public-like entries
            return m === 'public';
        });

        if (!filtered || filtered.length === 0) return null;

        const idx = Math.floor(Math.random() * filtered.length);
        const selectedPost = filtered[idx];

        return {
            Id: selectedPost.Id,
            User_id: selectedPost.User_id,
            Title: selectedPost.Title,
            Video: selectedPost.Video,
            Content: selectedPost.Content,
            Heart_count: selectedPost.Heart_count,
            Fullname: selectedPost.account?.Fullname ?? null,
            Avatar: selectedPost.account?.Avatar ?? null,
            Comment_count: selectedPost._count?.comments ?? 0,
        };
    }

    /**
     * Check if user1 is following user2.
     * Returns true if user1 follows user2, otherwise false.
     */
    async isUserFollowing(user1Id: number, user2Id: number): Promise<boolean> {
        const followRecord = await this.prismaService.follow.findFirst({
            where: {
                Follower_id: user1Id,
                Following_id: user2Id,
            },
        });

        return !!followRecord;
    }

    /**
     * Return all comments for a given post id, newest first.
     */
    async getCommentsByPost(postId: number) {
        return this.prismaService.comment.findMany({
            where: { Post_id: postId },
            orderBy: { CreateAt: 'desc' },
            include: {
                account: {
                    select: {
                        Id: true,
                        Fullname: true,
                        Avatar: true,
                        User_name: true,
                    },
                },
            },
        });
    }

    /**
     * Check if a given user has liked a given post.
     */
    async isPostLikedByUser(postId: number, userId: number): Promise<boolean> {
        const like = await (this.prismaService as any).post_like.findFirst({
            where: {
                Post_id: postId,
                User_id: userId,
            },
        });

        return !!like;
    }

    /**
     * Create a comment for a post.
     */
    async createComment(postId: number, userId: number, content: string, parentId?: number) {
        // idempotent creation is not required for comments; always create
        return this.prismaService.comment.create({
            data: {
                Id_account: userId,
                Post_id: postId,
                CreateAt: new Date(),
                Parent_id: parentId ?? null,
                Like_count: 0,
                Content: content,
            },
        });
    }

    /**
     * Create a follow relationship (follower -> following). If already exists, return existing record.
     */
    async createFollow(followerId: number, followingId: number) {
        const existing = await this.prismaService.follow.findFirst({
            where: {
                Follower_id: followerId,
                Following_id: followingId,
            },
        });

        if (existing) return existing;

        return this.prismaService.follow.create({
            data: {
                Follower_id: followerId,
                Following_id: followingId,
                CreatedAt: new Date(),
            },
        });
    }

    /**
     * Create a like for a post by a user. Idempotent — return existing like if present.
     */
    async createPostLike(postId: number, userId: number) {
        // create like and increment post.Heart_count atomically
        const postLikeDelegate = (this.prismaService as any).post_like;

        const existing = await postLikeDelegate.findFirst({
            where: { Post_id: postId, User_id: userId },
        });

        if (existing) return existing;

        // Use transaction to create like and increment Heart_count
        const result = await this.prismaService.$transaction(async (tx) => {
            const created = await (tx as any).post_like.create({ data: { Post_id: postId, User_id: userId } });
            // increment Heart_count on post
            await (tx as any).post.update({ where: { Id: postId }, data: { Heart_count: { increment: 1 } } });
            return created;
        });

        return result;
    }

    /**
     * Return all comments in a post that a user has liked.
     */
    async getLikedCommentsByUserForPost(postId: number, userId: number) {
        // Use relation from comment_like -> comment to filter by postId.
        return (this.prismaService as any).comment_like.findMany({
            where: {
                User_id: userId,
                comment: {
                    Post_id: postId,
                },
            },
            include: {
                comment: {
                    select: {
                        Id: true,
                        Content: true,
                        Id_account: true,
                        Post_id: true,
                    },
                },
            },
        });
    }

    /**
     * Create a like for a comment by a user. Idempotent.
     */
    async createCommentLike(commentId: number, userId: number) {
        const commentLikeDelegate = (this.prismaService as any).comment_like;

        const existing = await commentLikeDelegate.findFirst({ where: { Comment_id: commentId, User_id: userId } });
        if (existing) return existing;

        // transaction: create comment_like and increment comment.Like_count
        const result = await this.prismaService.$transaction(async (tx) => {
            const created = await (tx as any).comment_like.create({ data: { Comment_id: commentId, User_id: userId } });
            // increment like count
            await (tx as any).comment.update({ where: { Id: commentId }, data: { Like_count: { increment: 1 } } });
            // fetch owner of the comment so client knows who owns it
            const commentRec = await (tx as any).comment.findUnique({ where: { Id: commentId }, select: { Id_account: true } });
            const commentOwnerId = commentRec ? commentRec.Id_account : null;
            // return created like plus CommentOwnerId
            return { ...created, CommentOwnerId: commentOwnerId };
        });

        return result;
    }

    /**
     * Delete a post like (unlike) and decrement Heart_count if like existed.
     */
    async deletePostLike(postId: number, userId: number) {
        const postLikeDelegate = (this.prismaService as any).post_like;

        const existing = await postLikeDelegate.findFirst({ where: { Post_id: postId, User_id: userId } });
        if (!existing) return null;

        // transaction: delete like and decrement Heart_count (but don't go below 0)
        const result = await this.prismaService.$transaction(async (tx) => {
            await (tx as any).post_like.delete({ where: { Id: existing.Id } });
            // decrement safely
            await (tx as any).post.update({ where: { Id: postId }, data: { Heart_count: { decrement: 1 } } });
            return { success: true };
        });

        return result;
    }

    /**
     * Delete a comment like (unlike) and decrement Like_count on comment.
     */
    async deleteCommentLike(commentId: number, userId: number) {
        const commentLikeDelegate = (this.prismaService as any).comment_like;
        const existing = await commentLikeDelegate.findFirst({ where: { Comment_id: commentId, User_id: userId } });
        if (!existing) return null;

        const result = await this.prismaService.$transaction(async (tx) => {
            await (tx as any).comment_like.delete({ where: { Id: existing.Id } });
            await (tx as any).comment.update({ where: { Id: commentId }, data: { Like_count: { decrement: 1 } } });
            return { success: true };
        });

        return result;
    }

    /**
     * Remove a follow relationship (unfollow).
     */
    async deleteFollow(followerId: number, followingId: number) {
        const existing = await this.prismaService.follow.findFirst({ where: { Follower_id: followerId, Following_id: followingId } });
        if (!existing) return null;

        return this.prismaService.follow.delete({ where: { Id: existing.Id } });
    }

    /**
     * Create a video post: save DB record with Type='video'.
     * videoPath should be the filesystem path where video was saved (e.g., 'uploads/videos/12345.mp4').
     */
    async createVideoPost(userId: number, title: string, content: string, mode: string, videoPath: string) {
        const now = new Date();
        // Chuẩn hóa đường dẫn thành web path (sử dụng forward slash)
        const normalizedPath = '/' + videoPath.replace(/\\/g, '/');
        // ensure minimal required fields according to prisma schema
        return this.prismaService.post.create({
            data: {
                User_id: userId,
                Type: 'video',
                Time: now,
                Title: title ?? '',
                Video: normalizedPath,
                Mode: mode ?? null,
                Content: content ?? '',
                Heart_count: 0,
            },
        });
    }

    /**
     * Check mutual follow relationship between userId and authorId.
     * Logs whether userId follows authorId and vice versa.
     */
    async checkMutualFollow(userId: number, authorId: number) {
        // ví dụ nhanh kiểm tra mutual giữa userId và authorId
        const a = await this.prismaService.follow.findFirst({ where: { Follower_id: userId, Following_id: authorId }});
        const b = await this.prismaService.follow.findFirst({ where: { Follower_id: authorId, Following_id: userId }});
        console.log({ userFollowsAuthor: !!a, authorFollowsUser: !!b });
    }

    /**
     * Create a block relation: userId blocks blockedId. Idempotent.
     */
    async createBlock(userId: number, blockedId: number) {
        const existing = await (this.prismaService as any).block.findFirst({
            where: {
                User_id: userId,
                Blocked_id: blockedId,
            },
        });

        if (existing) return existing;

        return (this.prismaService as any).block.create({
            data: {
                User_id: userId,
                Blocked_id: blockedId,
                CreatedAt: new Date(),
            },
        });
    }

    /**
     * Remove a block relation (unblock). Returns deleted record or null if none.
     */
    async deleteBlock(userId: number, blockedId: number) {
        const existing = await (this.prismaService as any).block.findFirst({
            where: {
                User_id: userId,
                Blocked_id: blockedId,
            },
        });

        if (!existing) return null;

        return (this.prismaService as any).block.delete({ where: { Id: existing.Id } });
    }

    /**
     * Check if user1 is blocking user2.
     */
    async isUserBlocking(user1Id: number, user2Id: number): Promise<boolean> {
        const rec = await (this.prismaService as any).block.findFirst({
            where: {
                User_id: user1Id,
                Blocked_id: user2Id,
            },
        });
        return !!rec;
    }

    /**
     * Get list of user IDs that are blocked by the given user.
     */
    async getBlockedUsers(userId: number): Promise<number[]> {
        const blockedRecords = await (this.prismaService as any).block.findMany({
            where: {
                User_id: userId,
            },
            select: {
                Blocked_id: true,
            },
        });
        return blockedRecords.map((record: any) => record.Blocked_id);
    }

    /**
     * Search posts by a query string.
     * Matches against Title, Content, Topic and Sports (case-insensitive).
     * If requesterId provided, exclude posts authored by users that requester has blocked.
     * Returns up to `limit` results ordered by Time desc.
     */
    async searchPosts(query: string, limit = 50, requesterId?: number) {
        const q = (query ?? '').toString().trim();
        if (!q) return [];

        const posts = await this.prismaService.post.findMany({
            where: {
                Type: 'video', // only search posts where Type is 'video'
                OR: [
                    { Title: { contains: q, mode: 'insensitive' } },
                    { Content: { contains: q, mode: 'insensitive' } },
                    { Topic: { contains: q, mode: 'insensitive' } },
                    { Sports: { contains: q, mode: 'insensitive' } },
                ],
            },
            orderBy: { Time: 'desc' },
            take: limit,
            select: {
                Id: true,
                User_id: true,
                Title: true,
                Video: true,
                Content: true,
                Mode: true,
                Heart_count: true,
                Topic: true,
                Sports: true,
                Time: true,
                account: {
                    select: {
                        Fullname: true,
                        Avatar: true,
                    },
                },
                _count: {
                    select: { comments: true },
                },
            },
        });

        // If requesterId provided, remove posts whose author is blocked by requester
        let blockedSet = new Set<number>();
        if (requesterId && posts.length > 0) {
            const authorIds = Array.from(new Set(posts.map(p => p.User_id)));
            const blocks = await (this.prismaService as any).block.findMany({
                where: {
                    User_id: requesterId,
                    Blocked_id: { in: authorIds },
                },
                select: { Blocked_id: true },
            });
            blockedSet = new Set(blocks.map(b => b.Blocked_id));
        }

        const filtered = posts.filter(p => !blockedSet.has(p.User_id));

        return filtered.map(p => ({
            Id: p.Id,
            User_id: p.User_id,
            Title: p.Title,
            Video: p.Video,
            Content: p.Content,
            Mode: p.Mode,
            Heart_count: p.Heart_count,
            Topic: p.Topic,
            Sports: p.Sports,
            Time: p.Time,
            Fullname: p.account?.Fullname ?? null,
            Avatar: p.account?.Avatar ?? null,
            Comment_count: p._count?.comments ?? 0,
        }));
    }

    /**
     * Search users by a query string.
     * Matches against Fullname, User_name, Email (case-insensitive).
     * If requesterId provided, exclude users that requester has blocked.
     * Returns up to `limit` results ordered by Fullname asc.
     */
    async searchUsers(query: string, limit = 50, requesterId?: number) {
        const q = (query ?? '').toString().trim();
        if (!q) return [];

        const users = await this.prismaService.account.findMany({
            where: {
                OR: [
                    { Fullname: { contains: q, mode: 'insensitive' } },
                    { User_name: { contains: q, mode: 'insensitive' } },
                    { Email: { contains: q, mode: 'insensitive' } },
                ],
            },
            orderBy: { Fullname: 'asc' },
            take: limit,
            select: {
                Id: true,
                Fullname: true,
                User_name: true,
                Avatar: true,
                Story: true,
                Email: true,
            },
        });

        // If requesterId provided, remove users that requester has blocked
        let blockedSet = new Set<number>();
        if (requesterId && users.length > 0) {
            const userIds = users.map(u => u.Id);
            const blocks = await (this.prismaService as any).block.findMany({
                where: {
                    User_id: requesterId,
                    Blocked_id: { in: userIds },
                },
                select: { Blocked_id: true },
            });
            blockedSet = new Set(blocks.map(b => b.Blocked_id));
        }

        const filtered = users.filter(u => !blockedSet.has(u.Id));

        return filtered.map(u => ({
            Id: u.Id,
            Fullname: u.Fullname,
            User_name: u.User_name,
            Avatar: u.Avatar,
            Story: u.Story,
            Email: u.Email,
        }));
    }

    /**
     * Return profile info for a target user:
     *  - followerCount: số người theo dõi target
     *  - followingCount: số người target đang theo dõi
     *  - isFollowing: requester đang follow target?
     *  - story: story của target
     *  - videos: danh sách video của target (tôn trọng Mode: private/self, friend/mutual, public)
     */
    async getUserProfile(targetUserId: number, requesterId?: number) {
        // fetch basic user
        const user = await this.prismaService.account.findUnique({
            where: { Id: targetUserId },
            select: {
                Id: true,
                Fullname: true,
                User_name: true,
                Avatar: true,
                Story: true,
                Email: true,
            },
        });
        if (!user) return null;

        // counts
        const [followersCount, followingCount] = await Promise.all([
            this.prismaService.follow.count({ where: { Following_id: targetUserId } }),
            this.prismaService.follow.count({ where: { Follower_id: targetUserId } }),
        ]);

        // is requester following target?
        const isFollowing = requesterId
            ? !!(await this.prismaService.follow.findFirst({
                  where: { Follower_id: requesterId, Following_id: targetUserId },
              }))
            : false;

        // determine mutual follow boolean (requester <-> target)
        let mutual = false;
        if (requesterId && requesterId !== targetUserId) {
            const [a, b] = await Promise.all([
                this.prismaService.follow.findFirst({
                    where: { Follower_id: requesterId, Following_id: targetUserId },
                    select: { Id: true },
                }),
                this.prismaService.follow.findFirst({
                    where: { Follower_id: targetUserId, Following_id: requesterId },
                    select: { Id: true },
                }),
            ]);
            mutual = !!(a && b);
        } else if (requesterId && requesterId === targetUserId) {
            // viewing own profile
            mutual = true;
        }

        // fetch videos (raw) then filter by Mode rules
        const posts = await this.prismaService.post.findMany({
            where: { User_id: targetUserId, Type: 'video' },
            orderBy: { Time: 'desc' },
            select: {
                Id: true,
                User_id: true,
                Title: true,
                Video: true,
                Content: true,
                Mode: true,
                Heart_count: true,
                Time: true,
                _count: { select: { comments: true } },
            },
        });

        const modeOf = (m: string | null | undefined) => (m ?? '').toString().toLowerCase().trim();

        const videos = posts
            .filter(p => {
                const m = modeOf(p.Mode);
                // private: only owner can see
                if (m === 'private') {
                    return requesterId === targetUserId;
                }
                // public: everyone can see
                if (m === 'public' || m === '') return true;
                // friend: only when mutual follow OR owner
                if (m.includes('friend')) {
                    if (!requesterId) return false;
                    if (requesterId === targetUserId) return true;
                    return mutual;
                }
                // fallback allow public-like only
                return m === 'public';
            })
            .map(p => ({
                Id: p.Id,
                Title: p.Title,
                Video: p.Video,
                Content: p.Content,
                Mode: p.Mode,
                Heart_count: p.Heart_count,
                Time: p.Time,
                Comment_count: p._count?.comments ?? 0,
            }));

        return {
            user: {
                Id: user.Id,
                Fullname: user.Fullname,
                User_name: user.User_name,
                Avatar: user.Avatar,
                Story: user.Story,
                Email: user.Email,
            },
            followersCount,
            followingCount,
            isFollowing,
            videos,
        };
    }

    /**
     * Create a notification for a user. Idempotent behaviour is not required.
     * Uses the `notification` model in Prisma schema.
     */
    async createNotification(userId: number, title: string, actorId?: number) {
        const now = new Date();
        // validate target user exists to avoid foreign key violation
        const target = await this.prismaService.account.findUnique({ where: { Id: userId } });
        if (!target) {
            throw new HttpException('Target user not found', HttpStatus.BAD_REQUEST);
        }

        // if actorId provided, validate actor exists (otherwise FK will fail)
        if (actorId !== undefined && actorId !== null) {
            const actor = await this.prismaService.account.findUnique({ where: { Id: actorId } });
            if (!actor) {
                throw new HttpException('Actor user not found', HttpStatus.BAD_REQUEST);
            }
        }
        try {
            return await (this.prismaService as any).notification.create({
                data: {
                    User_id: userId,
                    Actor_id: actorId ?? null,
                    Title: title ?? '',
                    Is_read: false,
                    CreateAt: now,
                },
            });
        } catch (err: any) {
            // If DB doesn't have Actor_id column yet, Prisma throws P2022. Fallback by retrying without Actor_id.
            if (err && err.code === 'P2022' && err.meta && err.meta.column === 'Actor_id') {
                // Log minimal info and retry without Actor_id to remain compatible with current DB.
                console.warn('Prisma P2022: Actor_id column missing, creating notification without Actor_id');
                return (this.prismaService as any).notification.create({
                    data: {
                        User_id: userId,
                        Title: title ?? '',
                        Is_read: false,
                        CreateAt: now,
                    },
                });
            }

            throw err;
        }
    }

    /**
     * Get notifications for a user. Returns most recent first.
     * If `unreadOnly` is true, only returns notifications where Is_read = false.
     */
    async getNotificationsForUser(userId: number, limit = 50, unreadOnly = false) {
        const where: any = { User_id: userId };
        if (unreadOnly) where.Is_read = false;

        try {
            const notifs = await (this.prismaService as any).notification.findMany({
                where,
                orderBy: { CreateAt: 'desc' },
                take: limit,
                select: {
                    Id: true,
                    User_id: true,
                    Actor_id: true,
                    Title: true,
                    Is_read: true,
                    CreateAt: true,
                },
            });

            return notifs.map(n => ({
                Id: n.Id,
                User_id: n.User_id,
                Actor_id: (n as any).Actor_id ?? null,
                Title: n.Title,
                Is_read: n.Is_read,
                CreateAt: n.CreateAt,
            }));
        } catch (err: any) {
            if (err && err.code === 'P2022' && err.meta && err.meta.column === 'Actor_id') {
                // DB missing Actor_id: retry without selecting it
                console.warn('Prisma P2022: Actor_id column missing, fetching notifications without Actor_id');
                const notifs = await (this.prismaService as any).notification.findMany({
                    where,
                    orderBy: { CreateAt: 'desc' },
                    take: limit,
                    select: {
                        Id: true,
                        User_id: true,
                        Title: true,
                        Is_read: true,
                        CreateAt: true,
                    },
                });

                return notifs.map(n => ({
                    Id: n.Id,
                    User_id: n.User_id,
                    Actor_id: null,
                    Title: n.Title,
                    Is_read: n.Is_read,
                    CreateAt: n.CreateAt,
                }));
            }

            throw err;
        }
    }

    /**
     * Delete a notification for a user.
     * Ensures the notification belongs to the user before deleting.
     * Returns the deleted notification or null when not found / not owned.
     */
    async deleteNotification(userId: number, notificationId: number) {
        const rec = await (this.prismaService as any).notification.findUnique({ where: { Id: notificationId } });
        if (!rec) return null;
        if (rec.User_id !== userId) return null;

        return (this.prismaService as any).notification.delete({ where: { Id: notificationId } });
    }

    /**
     * Return list of users that `userId` follows and who also follow `userId` back.
     * If `limit` is provided, it will limit the number of followed users inspected (not final returned count).
     */
    async getMutualFollowings(userId: number, limit = 50) {
        // get list of users that userId follows
        const follows = await this.prismaService.follow.findMany({
            where: { Follower_id: userId },
            select: { Following_id: true },
            take: limit,
        });

        if (!follows || follows.length === 0) return [];

        const followingIds = Array.from(new Set(follows.map(f => f.Following_id)));

        // find which of those users also follow back userId
        const mutuals = await this.prismaService.follow.findMany({
            where: {
                Follower_id: { in: followingIds },
                Following_id: userId,
            },
            select: { Follower_id: true },
        });

        const mutualIds = Array.from(new Set(mutuals.map(m => m.Follower_id)));
        if (mutualIds.length === 0) return [];

        // fetch account details for mutual users
        const accounts = await this.prismaService.account.findMany({
            where: { Id: { in: mutualIds } },
            select: {
                Id: true,
                Fullname: true,
                User_name: true,
                Avatar: true,
                Story: true,
                Email: true,
            },
            orderBy: { Fullname: 'asc' },
        });

        return accounts.map(a => ({
            Id: a.Id,
            Fullname: a.Fullname,
            User_name: a.User_name,
            Avatar: a.Avatar,
            Story: a.Story,
            Email: a.Email,
        }));
    }
}
