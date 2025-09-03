import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}

async getUserMessages(userId: number) {
    const messages = await this.prisma.messages.findMany({
      where: {
        OR: [
          { Sender_id: userId },
          { Receiver_id: userId },
        ],
      },
      orderBy: { CreateAt: 'asc' },
      select: {
        Id: true,
        Sender_id: true,
        Receiver_id: true,
        Content: true,
        Status: true,
        CreateAt: true,
        // shared_post_data: true, // Removed because it's not a selectable field
        sender: { select: { Id: true, User_name: true, Avatar: true } },
        receiver: { select: { Id: true, User_name: true, Avatar: true } },
      },
    });

    // ✅ Parse shared post data and fix URLs  
    return messages.map(message => {
      let sharedPost = null;
      const rawShared = (message as any).shared_post_data; // <-- changed
      if (rawShared) {
        try {
          const parsedData = JSON.parse(rawShared);
          // Fix URLs in existing data
          sharedPost = {
            ...parsedData,
            image: parsedData.image ? parsedData.image : null,
            avatar: parsedData.avatar ? parsedData.avatar : null,
            images: parsedData.images?.map((img: any) => ({
              ...img,
              Url: img.Url
            })) || []
          };
        } catch (error) {
          console.error('Error parsing shared_post_data:', error);
        }
      }
      
      return {
        ...message,
        sharedPost,
      };
    });
  }


async sendMessage(senderId: number, receiverId: number, content: string) {
    // validate ids
    if (!Number.isInteger(senderId) || !Number.isInteger(receiverId)) {
      throw new BadRequestException('Invalid sender or receiver id');
    }

    // ensure both accounts exist to avoid FK errors
    const [sender, receiver] = await Promise.all([
      this.prisma.account.findUnique({ where: { Id: senderId } }),
      this.prisma.account.findUnique({ where: { Id: receiverId } }),
    ]);

    if (!sender || !receiver) {
      throw new NotFoundException('Sender or receiver not found');
    }

    return this.prisma.messages.create({
      data: {
        Sender_id: senderId,
        Receiver_id: receiverId,
        Content: content,
        Status: false,
        CreateAt: new Date(),
      },
    });
  }


   async getFollowing(userId: number) {
    if (!Number.isInteger(userId) || userId <= 0) return [];

    const rows = await this.prisma.follow.findMany({
      where: { Follower_id: userId },
      select: {
        following: { select: { Id: true, User_name: true, Avatar: true } },
      },
    });

    return rows.map((r) => r.following);
  }

  async getUserInfo(userId: number) {
    if (!Number.isInteger(userId) || userId <= 0) return null;
    return this.prisma.account.findUnique({
      where: { Id: userId },
      select: { Id: true, User_name: true, Avatar: true },
    });
  }

  async getConversation(userId: number, otherId: number) {
    if (!Number.isInteger(userId) || !Number.isInteger(otherId)) return [];
    const messages = await this.prisma.messages.findMany({
      where: {
        OR: [
          { Sender_id: userId, Receiver_id: otherId },
          { Sender_id: otherId, Receiver_id: userId },
        ],
      },
      orderBy: { CreateAt: 'asc' },
      include: {
        sender: { select: { Id: true, User_name: true, Avatar: true } },
        receiver: { select: { Id: true, User_name: true, Avatar: true } },
      },
    });

    // ✅ Parse shared post data and fix URLs
    return messages.map(message => {
      let sharedPost = null;
      const rawShared2 = (message as any).shared_post_data; // <-- changed
      if (rawShared2) {
        try {
          const parsedData = JSON.parse(rawShared2);
          // Fix URLs in existing data
          sharedPost = {
            ...parsedData,
            image: parsedData.image ? parsedData.image : null,
            avatar: parsedData.avatar ? parsedData.avatar : null,
            images: parsedData.images?.map(img => ({
              ...img,
              Url: img.Url
            })) || []
          };
        } catch (error) {
          console.error('Error parsing shared_post_data:', error);
        }
      }
      
      return {
        ...message,
        sharedPost,
      };
    });
  } 
  async updateStatus(userId:number, otherId:number)
  {
      if (!Number.isInteger(userId) || !Number.isInteger(otherId)) return false;

      const updateStatus = await this.prisma.messages.updateMany({
        where: { Sender_id:otherId , Receiver_id : userId},
        data : {
          Status : true
        }
      })
      return updateStatus.count > 0 ;
  }

  // ✅ Share post via chat
  async sharePost(senderId: number, receiverId: number, postId: number, message: string) {
    try {
      // Validate IDs
      if (!Number.isInteger(senderId) || !Number.isInteger(receiverId) || !Number.isInteger(postId)) {
        throw new BadRequestException('Invalid sender, receiver, or post ID');
      }

      // Check if post exists
      const post = await this.prisma.post.findUnique({
        where: { Id: postId },
        include: {
          account: { select: { Id: true, Fullname: true, User_name: true, Avatar: true } },
          images: { orderBy: { Order: 'asc' } },
        },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Create message with shared post data
      const PAUSE_IMAGE = 'http://192.168.1.29:3000/uploads/const/pause.jpg';
      const postAny = post as any; // safe access to non-typed fields
      const isVideo = Boolean(
        post?.Type === 'video' ||
        String(post?.Type) === '2' ||
        postAny.Is_video ||
        postAny.IsVideo ||
        postAny.Video ||
        postAny.VideoUrl ||
        (Array.isArray(postAny.videos) && postAny.videos.length > 0)
      );
      const imageUrl = isVideo
        ? PAUSE_IMAGE
        : (post.images?.[0]?.Url ? post.images[0].Url : null);
      const avatarUrl = post.account?.Avatar ? post.account.Avatar : null;
      
      console.log('🔍 Debug URLs:', {
        originalImage: post.images?.[0]?.Url,
        finalImageUrl: imageUrl,
        originalAvatar: post.account?.Avatar,
        finalAvatarUrl: avatarUrl
      });

      const messageData = {
        Sender_id: senderId,
        Receiver_id: receiverId,
        Content: message,
        CreateAt: new Date(),
        Status: false,
        // Store shared post info in JSON format for now
        shared_post_id: postId,
        shared_post_data: JSON.stringify({
          id: post.Id,
          title: post.Title,
          image: imageUrl,
          images: post.images?.map(img => ({ 
            Id: img.Id, 
            Url: img.Url, 
            Order: img.Order 
          })) || [],
          author: post.account?.Fullname || post.account?.User_name || 'Unknown',
          avatar: avatarUrl,
          timeAgo: this.formatTimeAgo(post.Time),
        }),
      };

      const newMessage = await this.prisma.messages.create({
        data: messageData,
        include: {
          sender: { select: { Id: true, User_name: true, Avatar: true } },
          receiver: { select: { Id: true, User_name: true, Avatar: true } },
        },
      });

      // Parse and attach shared post data
      const result = {
        ...newMessage,
        sharedPost: JSON.parse(messageData.shared_post_data),
      };

      return result;
    } catch (error) {
      console.error('Error sharing post:', error);
      throw error;
    }
  }

  private formatTimeAgo(dateString: string | Date): string {
    const now = new Date();
    const postTime = new Date(dateString);
    const diffMs = now.getTime() - postTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} ngày trước`;
    } else if (diffHours > 0) {
      return `${diffHours} giờ trước`;
    } else {
      return 'Vừa xong';
    }
  }

  // private getFullImageUrl(relativePath: string): string {
  //   if (!relativePath) return '';
    
  //   // If it's already a full URL with localhost, replace with actual IP
  //   if (relativePath.startsWith('http://localhost:3000')) {
  //     return relativePath.replace('http://localhost:3000', 'http://192.168.1.29:3000');
  //   }
    
  //   // If it's already a full URL with correct IP, return as is
  //   if (relativePath.startsWith('http://192.168.1.29:3000') || relativePath.startsWith('https://')) {
  //     return relativePath;
  //   }
    
  //   // Add base URL for relative paths
  //   return `http://192.168.1.29:3000/${relativePath.replace(/^\//, '')}`;
  // }

}
