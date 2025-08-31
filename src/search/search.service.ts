import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prismaService: PrismaService) {}

  async searchPosts(query: string, limit: number = 20) {
    try {
      const posts = await this.prismaService.post.findMany({
        where: {
          OR: [
            { Title: { contains: query, mode: 'insensitive' } },
            { Content: { contains: query, mode: 'insensitive' } },
            { Sports: { contains: query, mode: 'insensitive' } },
            { Topic: { contains: query, mode: 'insensitive' } },
            { Address: { contains: query, mode: 'insensitive' } },
          ],
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
          images: {
            orderBy: {
              Order: 'asc'
            }
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            }
          }
        },
        orderBy: {
          Time: 'desc'
        },
        take: limit,
      });

      return {
        success: true,
        data: posts,
      };
    } catch (error) {
      console.error('Error searching posts:', error);
      return {
        success: false,
        message: 'Failed to search posts',
      };
    }
  }

  async searchUsers(query: string, limit: number = 20) {
    try {
      const users = await this.prismaService.account.findMany({
        where: {
          OR: [
            { Fullname: { contains: query, mode: 'insensitive' } },
            { User_name: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          Id: true,
          Fullname: true,
          User_name: true,
          Avatar: true,
          Story: true,
          _count: {
            select: {
              followers: true,
              following: true,
              posts: true,
            }
          }
        },
        orderBy: {
          Id: 'desc'
        },
        take: limit,
      });

      return {
        success: true,
        data: users,
      };
    } catch (error) {
      console.error('Error searching users:', error);
      return {
        success: false,
        message: 'Failed to search users',
      };
    }
  }

  async searchAll(query: string, postLimit: number = 10, userLimit: number = 10) {
    try {
      const [postsResult, usersResult] = await Promise.all([
        this.searchPosts(query, postLimit),
        this.searchUsers(query, userLimit),
      ]);

      // Lấy các bài viết công khai từ những người dùng được tìm thấy
      let userPosts: any[] = [];
      if (usersResult.success && usersResult.data && usersResult.data.length > 0) {
        const userIds = usersResult.data.map((user: any) => user.Id);
        const userPostsResult = await this.getPublicPostsByUsers(userIds, postLimit);
        userPosts = userPostsResult.success ? (userPostsResult.data || []) : [];
      }

      return {
        success: true,
        data: {
          posts: postsResult.success ? postsResult.data : [],
          users: usersResult.success ? usersResult.data : [],
          userPosts: userPosts, // Bài viết từ những người dùng được tìm thấy
          query,
        },
      };
    } catch (error) {
      console.error('Error searching all:', error);
      return {
        success: false,
        message: 'Failed to search',
      };
    }
  }

  // Phương thức mới để lấy bài viết công khai từ danh sách người dùng
  async getPublicPostsByUsers(userIds: number[], limit: number = 20) {
    try {
      const posts = await this.prismaService.post.findMany({
        where: {
          User_id: {
            in: userIds
          },
          // Chỉ lấy bài viết công khai (không có điều kiện riêng tư nào)
          // Bạn có thể thêm điều kiện privacy ở đây nếu có field privacy trong schema
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
          images: {
            orderBy: {
              Order: 'asc'
            }
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            }
          }
        },
        orderBy: {
          Time: 'desc'
        },
        take: limit,
      });

      return {
        success: true,
        data: posts,
      };
    } catch (error) {
      console.error('Error getting public posts by users:', error);
      return {
        success: false,
        message: 'Failed to get user posts',
      };
    }
  }
}
