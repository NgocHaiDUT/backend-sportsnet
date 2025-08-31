import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto, LikeCommentDto } from './dto/comment.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class CommentService {
    constructor(
        private prismaService: PrismaService,
        private notificationService: NotificationService
    ) { }

    // Helper method to get comment with all details
    private async getCommentWithDetails(commentId: number) {
        return await this.prismaService.comment.findUnique({
            where: { Id: commentId },
            include: {
                account: {
                    select: {
                        Id: true,
                        Fullname: true,
                        User_name: true,
                        Avatar: true
                    }
                },
                post: {
                    select: {
                        Id: true,
                        Title: true
                    }
                },
                likes: {
                    include: {
                        account: {
                            select: {
                                Id: true,
                                Fullname: true,
                                User_name: true,
                                Avatar: true
                            }
                        }
                    }
                }
            }
        });
    }

    async createComment(createCommentDto: CreateCommentDto) {
        try {
            // Extract and ensure proper typing
            const postId = Number(createCommentDto.postId);
            const userId = Number(createCommentDto.userId);
            const content = String(createCommentDto.content || '').trim();
            const parentId = createCommentDto.parentId ? Number(createCommentDto.parentId) : undefined;

            console.log('=== CREATE COMMENT SERVICE DEBUG ===');
            console.log('Service received DTO:', createCommentDto);
            console.log('Extracted values:', { postId, userId, content, parentId });

            // Final validation at service level
            if (isNaN(postId) || postId <= 0) {
                throw new BadRequestException('Post ID không hợp lệ');
            }

            if (isNaN(userId) || userId <= 0) {
                throw new BadRequestException('User ID không hợp lệ');
            }

            if (!content || content.length === 0) {
                throw new BadRequestException('Nội dung comment không được để trống');
            }

            // Kiểm tra bài viết có tồn tại không
            const post = await this.prismaService.post.findUnique({
                where: { Id: postId }
            });

            if (!post) {
                throw new NotFoundException('Bài viết không tồn tại');
            }

            // Kiểm tra user có tồn tại không
            const user = await this.prismaService.account.findUnique({
                where: { Id: userId }
            });

            if (!user) {
                throw new NotFoundException('User không tồn tại');
            }

            // Nếu là reply comment, kiểm tra parent comment có tồn tại không
            if (parentId) {
                const parentComment = await this.prismaService.comment.findUnique({
                    where: { Id: parentId }
                });

                if (!parentComment) {
                    throw new NotFoundException('Comment cha không tồn tại');
                }

                if (parentComment.Post_id !== postId) {
                    throw new BadRequestException('Comment cha không thuộc bài viết này');
                }
            }

            // Tạo comment mới
            const newComment = await this.prismaService.comment.create({
                data: {
                    Post_id: postId,
                    Id_account: userId,
                    Content: content,
                    Parent_id: parentId,
                    CreateAt: new Date(),
                    Like_count: 0
                },
                include: {
                    account: {
                        select: {
                            Id: true,
                            Fullname: true,
                            User_name: true,
                            Avatar: true
                        }
                    },
                    post: {
                        select: {
                            Id: true,
                            Title: true
                        }
                    },
                    likes: {
                        include: {
                            account: {
                                select: {
                                    Id: true,
                                    Fullname: true,
                                    User_name: true
                                }
                            }
                        }
                    }
                }
            });

            // ✅ Send appropriate notifications
            if (parentId) {
                // If this is a reply, notify the parent comment owner
                await this.notificationService.notifyReplyComment(parentId, userId);
            } else {
                // If this is a direct comment on post, notify the post owner
                await this.notificationService.notifyCommentPost(postId, userId);
            }

            return {
                success: true,
                message: 'Tạo comment thành công',
                data: newComment
            };
        } catch (error) {
            console.error('Error creating comment:', error);
            throw new BadRequestException(error.message || 'Không thể tạo comment');
        }
    }

    // ✅ NEW: Recursive helper method to get all nested replies
    private async getRepliesRecursively(commentId: number): Promise<any[]> {
        const replies = await this.prismaService.comment.findMany({
            where: {
                Parent_id: commentId
            },
            include: {
                account: {
                    select: {
                        Id: true,
                        Fullname: true,
                        User_name: true,
                        Avatar: true,
                    }
                },
                likes: {
                    include: {
                        account: {
                            select: {
                                Id: true,
                                Fullname: true,
                                User_name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                CreateAt: 'asc'
            }
        });

        // Recursively get replies for each reply
        const repliesWithNestedReplies = await Promise.all(
            replies.map(async (reply) => {
                const nestedReplies = await this.getRepliesRecursively(reply.Id);
                return {
                    ...reply,
                    replies: nestedReplies.length > 0 ? nestedReplies : undefined
                };
            })
        );

        return repliesWithNestedReplies;
    }

    async getCommentsByPostId(postId: number) {
        try {
            console.log('=== GET COMMENTS BY POST ID DEBUG ===');
            console.log('Post ID:', postId);

            // Validate post exists
            const post = await this.prismaService.post.findUnique({
                where: { Id: postId },
                include: {
                    images: true
                }
            });

            if (!post) {
                throw new NotFoundException('Bài viết không tồn tại');
            }

            const comments = await this.prismaService.comment.findMany({
                where: { 
                    Post_id: postId,
                    Parent_id: null // Only get parent comments
                },
                include: {
                    account: {
                        select: {
                            Id: true,
                            Fullname: true,
                            User_name: true,
                            Avatar: true,
                        }
                    },
                    likes: {
                        include: {
                            account: {
                                select: {
                                    Id: true,
                                    Fullname: true,
                                    User_name: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    CreateAt: 'desc'
                }
            });

            // ✅ UPDATED: Get replies recursively for each parent comment
            const commentsWithReplies = await Promise.all(
                comments.map(async (comment) => {
                    const replies = await this.getRepliesRecursively(comment.Id);
                    return {
                        ...comment,
                        replies: replies.length > 0 ? replies : undefined
                    };
                })
            );

            console.log('=== RECURSIVE REPLIES DEBUG ===');
            commentsWithReplies.forEach((comment, index) => {
                console.log(`Comment ${index + 1} (ID: ${comment.Id}):`, {
                    content: comment.Content,
                    repliesCount: comment.replies ? comment.replies.length : 0
                });
                
                if (comment.replies) {
                    const logReplies = (replies: any[], level = 1) => {
                        replies.forEach((reply, replyIndex) => {
                            const indent = '  '.repeat(level);
                            console.log(`${indent}Reply ${replyIndex + 1} (ID: ${reply.Id}):`, {
                                content: reply.Content,
                                nestedRepliesCount: reply.replies ? reply.replies.length : 0
                            });
                            
                            if (reply.replies && reply.replies.length > 0) {
                                logReplies(reply.replies, level + 1);
                            }
                        });
                    };
                    logReplies(comment.replies);
                }
            });
            console.log('=== END RECURSIVE DEBUG ===');

            return {
                success: true,
                data: commentsWithReplies,
            };
        } catch (error) {
            console.error('Error fetching comments:', error);
            throw new BadRequestException(error.message || 'Không thể lấy danh sách comments');
        }
    }

    async updateComment(id: number, updateCommentDto: UpdateCommentDto) {
        try {
            const { content } = updateCommentDto;

            if (!content || content.trim().length === 0) {
                throw new BadRequestException('Nội dung comment không được để trống');
            }

            const existingComment = await this.prismaService.comment.findUnique({
                where: { Id: id }
            });

            if (!existingComment) {
                throw new NotFoundException('Comment không tồn tại');
            }

            const updatedComment = await this.prismaService.comment.update({
                where: { Id: id },
                data: { Content: content.trim() },
                include: {
                    account: {
                        select: {
                            Id: true,
                            Fullname: true,
                            User_name: true,
                            Avatar: true
                        }
                    },
                    likes: {
                        include: {
                            account: {
                                select: {
                                    Id: true,
                                    Fullname: true,
                                    User_name: true
                                }
                            }
                        }
                    }
                }
            });

            return {
                success: true,
                message: 'Cập nhật comment thành công',
                data: updatedComment
            };
        } catch (error) {
            console.error('Error updating comment:', error);
            throw new BadRequestException(error.message || 'Không thể cập nhật comment');
        }
    }

    async deleteComment(id: number) {
        try {
            const comment = await this.prismaService.comment.findUnique({
                where: { Id: id }
            });

            if (!comment) {
                throw new NotFoundException('Comment không tồn tại');
            }

            // Xóa tất cả replies của comment này trước
            await this.prismaService.comment.deleteMany({
                where: { Parent_id: id }
            });

            // Xóa comment chính
            await this.prismaService.comment.delete({
                where: { Id: id }
            });

            return {
                success: true,
                message: 'Xóa comment thành công'
            };
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw new BadRequestException('Không thể xóa comment');
        }
    }

    async likeComment(commentId: number, userId: number) {
        try {
            console.log('=== LIKE COMMENT DEBUG ===');
            console.log('Comment ID:', commentId);
            console.log('User ID:', userId);

            // Validate comment exists
            const comment = await this.prismaService.comment.findUnique({
                where: { Id: commentId }
            });

            if (!comment) {
                throw new NotFoundException('Comment không tồn tại');
            }

            // Check if user already liked this comment
            const existingLike = await this.prismaService.comment_like.findUnique({
                where: {
                    User_id_Comment_id: {
                        User_id: userId,
                        Comment_id: commentId
                    }
                }
            });

            if (existingLike) {
                throw new BadRequestException('Bạn đã like comment này rồi');
            }

            // Create like record
            await this.prismaService.comment_like.create({
                data: {
                    User_id: userId,
                    Comment_id: commentId
                }
            });

            // Update like count
            const updatedComment = await this.prismaService.comment.update({
                where: { Id: commentId },
                data: {
                    Like_count: {
                        increment: 1
                    }
                },
                include: {
                    account: {
                        select: {
                            Id: true,
                            Fullname: true,
                            User_name: true,
                            Avatar: true
                        }
                    },
                    likes: {
                        include: {
                            account: {
                                select: {
                                    Id: true,
                                    Fullname: true,
                                    User_name: true
                                }
                            }
                        }
                    }
                }
            });

            // ✅ Send notification to comment owner about like
            await this.notificationService.notifyLikeComment(commentId, userId);

            return {
                success: true,
                message: 'Đã like comment',
                data: updatedComment
            };
        } catch (error) {
            console.error('Error liking comment:', error);
            throw new BadRequestException(error.message || 'Không thể like comment');
        }
    }

    async unlikeComment(commentId: number, userId: number) {
        try {
            console.log('=== UNLIKE COMMENT DEBUG ===');
            console.log('Comment ID:', commentId);
            console.log('User ID:', userId);

            // Validate comment exists
            const comment = await this.prismaService.comment.findUnique({
                where: { Id: commentId }
            });

            if (!comment) {
                throw new NotFoundException('Comment không tồn tại');
            }

            // Check if user has liked this comment
            const existingLike = await this.prismaService.comment_like.findUnique({
                where: {
                    User_id_Comment_id: {
                        User_id: userId,
                        Comment_id: commentId
                    }
                }
            });

            if (!existingLike) {
                throw new BadRequestException('Bạn chưa like comment này');
            }

            // Remove like record
            await this.prismaService.comment_like.delete({
                where: {
                    User_id_Comment_id: {
                        User_id: userId,
                        Comment_id: commentId
                    }
                }
            });

            // Update like count
            const updatedComment = await this.prismaService.comment.update({
                where: { Id: commentId },
                data: {
                    Like_count: {
                        decrement: 1
                    }
                },
                include: {
                    account: {
                        select: {
                            Id: true,
                            Fullname: true,
                            User_name: true,
                            Avatar: true
                        }
                    },
                    likes: {
                        include: {
                            account: {
                                select: {
                                    Id: true,
                                    Fullname: true,
                                    User_name: true
                                }
                            }
                        }
                    }
                }
            });

            return {
                success: true,
                message: 'Đã unlike comment',
                data: updatedComment
            };
        } catch (error) {
            console.error('Error unliking comment:', error);
            throw new BadRequestException(error.message || 'Không thể unlike comment');
        }
    }

    async getCommentLikes(commentId: number) {
        try {
            const likes = await this.prismaService.comment_like.findMany({
                where: { Comment_id: commentId },
                include: {
                    account: {
                        select: {
                            Id: true,
                            Fullname: true,
                            User_name: true,
                            Avatar: true
                        }
                    }
                },
                orderBy: {
                    Id: 'desc'
                }
            });

            return {
                success: true,
                data: likes
            };
        } catch (error) {
            console.error('Error getting comment likes:', error);
            throw new BadRequestException('Không thể lấy danh sách likes');
        }
    }

    async checkUserLikedComment(commentId: number, userId: number) {
        try {
            const like = await this.prismaService.comment_like.findUnique({
                where: {
                    User_id_Comment_id: {
                        User_id: userId,
                        Comment_id: commentId
                    }
                }
            });

            return {
                success: true,
                data: {
                    hasLiked: !!like
                }
            };
        } catch (error) {
            console.error('Error checking user liked comment:', error);
            return {
                success: true,
                data: {
                    hasLiked: false
                }
            };
        }
    }

    async getCommentById(id: number) {
        try {
            const comment = await this.getCommentWithDetails(id);

            if (!comment) {
                throw new NotFoundException('Comment không tồn tại');
            }

            return {
                success: true,
                data: comment
            };
        } catch (error) {
            console.error('Error getting comment by id:', error);
            throw new BadRequestException('Không thể lấy thông tin comment');
        }
    }

    async replyToComment(createCommentDto: CreateCommentDto) {
        // Reply to comment is the same as creating a comment with parentId
        return this.createComment(createCommentDto);
    }

    async getRepliesByCommentId(commentId: number) {
        try {
            const replies = await this.prismaService.comment.findMany({
                where: { Parent_id: commentId },
                include: {
                    account: {
                        select: {
                            Id: true,
                            Fullname: true,
                            User_name: true,
                            Avatar: true,
                        }
                    },
                    likes: {
                        include: {
                            account: {
                                select: {
                                    Id: true,
                                    Fullname: true,
                                    User_name: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    CreateAt: 'asc'
                }
            });

            return {
                success: true,
                data: replies
            };
        } catch (error) {
            console.error('Error getting replies:', error);
            throw new BadRequestException('Không thể lấy danh sách replies');
        }
    }
}
