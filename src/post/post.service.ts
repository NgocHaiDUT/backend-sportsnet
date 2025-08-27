import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto, UploadImagesDto, LikePostDto } from './dto/post.dto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PostService {
  constructor(private prismaService: PrismaService) {}

  // Helper method to get post with all details
  private async getPostWithDetails(postId: number) {
    return await this.prismaService.post.findUnique({
      where: { Id: postId },
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
        comments: {
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
                    User_name: true,
                  }
                }
              }
            }
          },
          orderBy: {
            CreateAt: 'desc'
          }
        },
        likes: {
          include: {
            account: {
              select: {
                Id: true,
                Fullname: true,
                User_name: true,
              }
            }
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          }
        }
      }
    });
  }

  async createPost(createPostDto: CreatePostDto) {
    try {
      const { userId, imageUrls, ...postData } = createPostDto;

      console.log('=== CREATE POST DEBUG ===');
      console.log('Received data:', createPostDto);

      // Validate user exists
      const user = await this.prismaService.account.findUnique({
        where: { Id: userId }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Create post
      const post = await this.prismaService.post.create({
        data: {
          User_id: userId,
          Type: postData.type,
          Time: new Date(),
          Title: postData.title,
          Content: postData.content,
          Video: postData.video,
          Mode: postData.mode,
          Address: postData.address,
          Sports: postData.sports,
          Topic: postData.topic,
          Heart_count: 0,
        }
      });

      // Add images if provided
      if (imageUrls && imageUrls.length > 0) {
        const imageData = imageUrls.map((url, index) => ({
          Post_id: post.Id,
          Url: url,
          Order: index + 1,
        }));

        await this.prismaService.image.createMany({
          data: imageData,
        });
      }

      // Fetch updated post with all details
      const result = await this.getPostWithDetails(post.Id);
      
      return {
        success: true,
        message: 'Post created successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error creating post:', error);
      throw new BadRequestException('Failed to create post: ' + error.message);
    }
  }

  async uploadPostImages(postId: number, files: Express.Multer.File[]) {
    try {
      // Validate post exists
      const post = await this.prismaService.post.findUnique({
        where: { Id: postId }
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      const uploadedImages: any[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        console.log(`Processing file ${i + 1}:`, {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          hasBuffer: !!file.buffer,
          bufferLength: file.buffer?.length
        });
        
        if (!file.buffer) {
          console.error(`File ${i + 1} has no buffer:`, file);
          throw new BadRequestException(`File ${file.originalname} has no buffer data`);
        }
        
        // Tạo thư mục uploads/posts nếu chưa có
        const uploadsDir = path.join(process.cwd(), 'uploads', 'posts');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Tạo tên file unique
        const fileName = `post_${postId}_${Date.now()}_${i + 1}${path.extname(file.originalname)}`;
        const filePath = path.join(uploadsDir, fileName);
        
        // Save file
        fs.writeFileSync(filePath, file.buffer);
        
        const imageUrl = `/uploads/posts/${fileName}`;
        
        // Get current max order
        const maxOrder = await this.prismaService.image.findFirst({
          where: { Post_id: postId },
          orderBy: { Order: 'desc' },
          select: { Order: true }
        });

        const order = maxOrder ? maxOrder.Order + 1 : 1;
        
        // Save to database
        const image = await this.prismaService.image.create({
          data: {
            Post_id: postId,
            Url: imageUrl,
            Order: order + i,
          }
        });

        uploadedImages.push(image);
      }

      return {
        success: true,
        message: 'Images uploaded successfully',
        data: uploadedImages,
      };
    } catch (error) {
      console.error('Error uploading images:', error);
      throw new BadRequestException('Failed to upload images: ' + error.message);
    }
  }

  async uploadPostImagesBase64(postId: number, images: Array<{ fileName: string; base64Data: string; mimeType: string }>) {
    try {
      // Validate post exists
      const post = await this.prismaService.post.findUnique({
        where: { Id: postId }
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // ✅ TĂNG TỐC: Lấy order một lần thay vì query từng ảnh
      const maxOrder = await this.prismaService.image.findFirst({
        where: { Post_id: postId },
        orderBy: { Order: 'desc' },
        select: { Order: true }
      });
      const startOrder = maxOrder ? maxOrder.Order + 1 : 1;

      // ✅ TĂNG TỐC: Xử lý song song thay vì tuần tự
      const uploadPromises = images.map(async (image, i) => {
        console.log(`Processing base64 image ${i + 1}:`, {
          fileName: image.fileName,
          mimeType: image.mimeType,
          dataSize: image.base64Data.length
        });
        
        // Tạo thư mục uploads/posts nếu chưa có
        const uploadsDir = path.join(process.cwd(), 'uploads', 'posts');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Sử dụng fileName từ client hoặc tạo tên mới
        const fileName = image.fileName || `post_${postId}_${Date.now()}_${i + 1}.jpg`;
        const filePath = path.join(uploadsDir, fileName);
        
        // Convert base64 to buffer and save file
        const buffer = Buffer.from(image.base64Data, 'base64');
        fs.writeFileSync(filePath, buffer);
        
        const imageUrl = `/uploads/posts/${fileName}`;
        
        return {
          Post_id: postId,
          Url: imageUrl,
          Order: startOrder + i,
        };
      });

      // Đợi tất cả file được xử lý song song
      const imageData = await Promise.all(uploadPromises);
      
      // ✅ TĂNG TỐC: Insert tất cả record một lần thay vì từng cái
      const uploadedImages = await this.prismaService.image.createMany({
        data: imageData,
      });

      return {
        success: true,
        message: 'Images uploaded successfully',
        data: uploadedImages,
      };
    } catch (error) {
      console.error('Error uploading base64 images:', error);
      throw new BadRequestException('Failed to upload images: ' + error.message);
    }
  }

  async getAllPosts() {
    try {
      const posts = await this.prismaService.post.findMany({
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
          likes: {
            include: {
              account: {
                select: {
                  Id: true,
                  Fullname: true,
                  User_name: true,
                }
              }
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
        }
      });

      // Debug logging
      console.log('=== getAllPosts DEBUG ===');
      console.log('Total posts found:', posts.length);
      
      // Check all images in database
      const allImages = await this.prismaService.image.findMany({
        select: {
          Id: true,
          Post_id: true,
          Url: true,
          Order: true
        },
        orderBy: {
          Post_id: 'asc'
        }
      });
      console.log('All images in database:', allImages);
      
      posts.forEach((post, index) => {
        console.log(`Post ${index + 1}:`, {
          id: post.Id,
          title: post.Title,
          imageCount: post.images?.length || 0,
          images: post.images?.map(img => ({ Id: img.Id, Url: img.Url, Order: img.Order })) || []
        });
      });

      return {
        success: true,
        data: posts,
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw new BadRequestException('Failed to fetch posts');
    }
  }

  async getPostById(id: number) {
    try {
      const post = await this.getPostWithDetails(id);

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      return {
        success: true,
        data: post,
      };
    } catch (error) {
      console.error('Error fetching post:', error);
      throw new BadRequestException('Failed to fetch post');
    }
  }

  async getPostsByUserId(userId: number) {
    try {
      const posts = await this.prismaService.post.findMany({
        where: { User_id: userId },
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
          likes: {
            include: {
              account: {
                select: {
                  Id: true,
                  Fullname: true,
                  User_name: true,
                }
              }
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
        }
      });

      return {
        success: true,
        data: posts,
      };
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw new BadRequestException('Failed to fetch user posts');
    }
  }

  async updatePost(id: number, updatePostDto: UpdatePostDto) {
    try {
      const { imageUrls, ...updateData } = updatePostDto;

      // Check if post exists
      const existingPost = await this.prismaService.post.findUnique({
        where: { Id: id }
      });

      if (!existingPost) {
        throw new NotFoundException('Post not found');
      }

      // Update post
      await this.prismaService.post.update({
        where: { Id: id },
        data: {
          Title: updateData.title,
          Content: updateData.content,
          Video: updateData.video,
          Mode: updateData.mode,
          Address: updateData.address,
          Sports: updateData.sports,
          Topic: updateData.topic,
        }
      });

      // Update images if provided
      if (imageUrls !== undefined) {
        // Delete existing images
        await this.prismaService.image.deleteMany({
          where: { Post_id: id }
        });

        // Add new images
        if (imageUrls.length > 0) {
          const imageData = imageUrls.map((url, index) => ({
            Post_id: id,
            Url: url,
            Order: index + 1,
          }));

          await this.prismaService.image.createMany({
            data: imageData,
          });
        }
      }

      // Fetch updated post with relations
      const result = await this.getPostWithDetails(id);

      return {
        success: true,
        message: 'Post updated successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error updating post:', error);
      throw new BadRequestException('Failed to update post: ' + error.message);
    }
  }

  async deletePost(id: number) {
    try {
      const post = await this.prismaService.post.findUnique({
        where: { Id: id }
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Delete post (images will be deleted automatically due to cascade)
      await this.prismaService.post.delete({
        where: { Id: id }
      });

      return {
        success: true,
        message: 'Post deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new BadRequestException('Failed to delete post');
    }
  }

  async likePost(postId: number, userId: number) {
    try {
      const post = await this.prismaService.post.findUnique({
        where: { Id: postId }
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Check if user already liked this post
      const existingLike = await this.prismaService.post_like.findFirst({
        where: {
          User_id: userId,
          Post_id: postId
        }
      });

      if (existingLike) {
        throw new BadRequestException('You already liked this post');
      }

      // Create like record
      await this.prismaService.post_like.create({
        data: {
          User_id: userId,
          Post_id: postId
        }
      });

      // Update heart count
      const updatedPost = await this.prismaService.post.update({
        where: { Id: postId },
        data: {
          Heart_count: {
            increment: 1
          }
        }
      });

      // Get updated post with details
      const result = await this.getPostWithDetails(postId);

      return {
        success: true,
        message: 'Post liked successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error liking post:', error);
      throw new BadRequestException('Failed to like post: ' + error.message);
    }
  }

  async unlikePost(postId: number, userId: number) {
    try {
      const post = await this.prismaService.post.findUnique({
        where: { Id: postId }
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Check if user has liked this post
      const existingLike = await this.prismaService.post_like.findFirst({
        where: {
          User_id: userId,
          Post_id: postId
        }
      });

      if (!existingLike) {
        throw new BadRequestException('You have not liked this post');
      }

      // Remove like record
      await this.prismaService.post_like.delete({
        where: { Id: existingLike.Id }
      });

      // Update heart count
      await this.prismaService.post.update({
        where: { Id: postId },
        data: {
          Heart_count: {
            decrement: 1
          }
        }
      });

      // Get updated post with details
      const result = await this.getPostWithDetails(postId);

      return {
        success: true,
        message: 'Post unliked successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error unliking post:', error);
      throw new BadRequestException('Failed to unlike post: ' + error.message);
    }
  }

  async addImagesToPost(postId: number, imageUrls: string[]) {
    try {
      const post = await this.prismaService.post.findUnique({
        where: { Id: postId }
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Get current max order
      const maxOrder = await this.prismaService.image.findFirst({
        where: { Post_id: postId },
        orderBy: { Order: 'desc' },
        select: { Order: true }
      });

      const startOrder = maxOrder ? maxOrder.Order + 1 : 1;

      const imageData = imageUrls.map((url, index) => ({
        Post_id: postId,
        Url: url,
        Order: startOrder + index,
      }));

      const images = await this.prismaService.image.createMany({
        data: imageData,
      });

      return {
        success: true,
        message: 'Images added successfully',
        data: images,
      };
    } catch (error) {
      console.error('Error adding images to post:', error);
      throw new BadRequestException('Failed to add images: ' + error.message);
    }
  }

  // ✅ New method to upload sample images with encoded names
  async uploadSampleImages(postId: number, files: Express.Multer.File[]) {
    try {
      // Validate post exists
      const post = await this.prismaService.post.findUnique({
        where: { Id: postId }
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      const uploadedImages: any[] = [];
      
      // Get current max order
      const maxOrder = await this.prismaService.image.findFirst({
        where: { Post_id: postId },
        orderBy: { Order: 'desc' },
        select: { Order: true }
      });
      const startOrder = maxOrder ? maxOrder.Order + 1 : 1;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        console.log(`Processing sample image ${i + 1}:`, {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          hasBuffer: !!file.buffer,
        });
        
        if (!file.buffer) {
          console.error(`Sample image ${i + 1} has no buffer:`, file);
          throw new BadRequestException(`Sample image ${file.originalname} has no buffer data`);
        }
        
        // Tạo thư mục uploads/posts nếu chưa có
        const uploadsDir = path.join(process.cwd(), 'uploads', 'posts');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // ✅ Tạo tên file mã hóa để tránh trùng lặp
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const originalExt = path.extname(file.originalname) || '.jpg';
        const encodedFileName = `sample_${postId}_${timestamp}_${randomString}${originalExt}`;
        const filePath = path.join(uploadsDir, encodedFileName);
        
        // Save file với tên đã mã hóa
        fs.writeFileSync(filePath, file.buffer);
        
        const imageUrl = `/uploads/posts/${encodedFileName}`;
        
        // Save to database
        const image = await this.prismaService.image.create({
          data: {
            Post_id: postId,
            Url: imageUrl,
            Order: startOrder + i,
          }
        });

        uploadedImages.push(image);
        
        console.log(`Sample image ${i + 1} uploaded successfully:`, {
          originalName: file.originalname,
          encodedName: encodedFileName,
          imageUrl,
          order: startOrder + i
        });
      }

      return {
        success: true,
        message: 'Sample images uploaded successfully',
        data: uploadedImages,
      };
    } catch (error) {
      console.error('Error uploading sample images:', error);
      throw new BadRequestException('Failed to upload sample images: ' + error.message);
    }
  }

  // ✅ New method to upload sample images via base64 with encoded names
  async uploadSampleImagesBase64(postId: number, images: Array<{ fileName: string; base64Data: string; mimeType: string }>) {
    try {
      // Validate post exists
      const post = await this.prismaService.post.findUnique({
        where: { Id: postId }
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Get current max order
      const maxOrder = await this.prismaService.image.findFirst({
        where: { Post_id: postId },
        orderBy: { Order: 'desc' },
        select: { Order: true }
      });
      const startOrder = maxOrder ? maxOrder.Order + 1 : 1;

      // ✅ Xử lý song song để tăng tốc
      const uploadPromises = images.map(async (image, i) => {
        console.log(`Processing sample base64 image ${i + 1}:`, {
          fileName: image.fileName,
          mimeType: image.mimeType,
          dataSize: image.base64Data.length
        });
        
        // Tạo thư mục uploads/posts nếu chưa có
        const uploadsDir = path.join(process.cwd(), 'uploads', 'posts');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Sử dụng fileName đã được mã hóa từ client
        const fileName = image.fileName;
        const filePath = path.join(uploadsDir, fileName);
        
        // Convert base64 to buffer and save file
        const buffer = Buffer.from(image.base64Data, 'base64');
        fs.writeFileSync(filePath, buffer);
        
        const imageUrl = `/uploads/posts/${fileName}`;
        
        console.log(`Sample image ${i + 1} saved:`, {
          fileName,
          imageUrl,
          fileSizeKB: Math.round(buffer.length / 1024)
        });
        
        return {
          Post_id: postId,
          Url: imageUrl,
          Order: startOrder + i,
        };
      });

      // Đợi tất cả file được xử lý song song
      const imageData = await Promise.all(uploadPromises);
      
      // Insert tất cả record một lần
      const uploadedImages = await this.prismaService.image.createMany({
        data: imageData,
      });

      return {
        success: true,
        message: 'Sample images uploaded successfully via base64',
        data: uploadedImages,
      };
    } catch (error) {
      console.error('Error uploading sample base64 images:', error);
      throw new BadRequestException('Failed to upload sample images: ' + error.message);
    }
  }

  async removeImageFromPost(imageId: number) {
    try {
      const image = await this.prismaService.image.findUnique({
        where: { Id: imageId }
      });

      if (!image) {
        throw new NotFoundException('Image not found');
      }

      await this.prismaService.image.delete({
        where: { Id: imageId }
      });

      return {
        success: true,
        message: 'Image removed successfully',
      };
    } catch (error) {
      console.error('Error removing image:', error);
      throw new BadRequestException('Failed to remove image: ' + error.message);
    }
  }

  async getPostLikes(postId: number) {
    try {
      const likes = await this.prismaService.post_like.findMany({
        where: { Post_id: postId },
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
      });

      return {
        success: true,
        data: likes
      };
    } catch (error) {
      console.error('Error getting post likes:', error);
      throw new BadRequestException('Failed to get post likes: ' + error.message);
    }
  }

  async checkUserLikedPost(postId: number, userId: number) {
    try {
      const like = await this.prismaService.post_like.findFirst({
        where: {
          User_id: userId,
          Post_id: postId
        }
      });

      return {
        success: true,
        data: {
          hasLiked: !!like
        }
      };
    } catch (error) {
      console.error('Error checking user liked post:', error);
      return {
        success: true,
        data: {
          hasLiked: false
        }
      };
    }
  }

  async sharePost(postId: string, userIds: number[], message?: string) {
    try {
      console.log('=== SHARE POST SERVICE DEBUG ===');
      console.log('Post ID:', postId);
      console.log('User IDs:', userIds);
      console.log('Message:', message);

      // Verify post exists
      const post = await this.prismaService.post.findUnique({
        where: { Id: Number(postId) },
        include: {
          account: {
            select: {
              Id: true,
              Fullname: true,
              User_name: true,
            }
          }
        }
      });

      if (!post) {
        return {
          success: false,
          message: 'Post not found'
        };
      }

      // For now, just log the share action
      // In a real app, you might:
      // 1. Create notification records
      // 2. Send messages to users
      // 3. Track share statistics
      console.log(`Post "${post.Title}" shared to ${userIds.length} users with message: "${message}"`);

      // Create notifications for shared users (optional)
      const notifications = userIds.map(userId => ({
        User_id: userId,
        Type: 'share',
        Content: message || `${post.account.Fullname} shared a post with you: "${post.Title}"`,
        Time: new Date(),
        Is_read: false,
      }));

      // Insert notifications if needed
      // await this.prismaService.notification.createMany({
      //   data: notifications
      // });

      return {
        success: true,
        message: `Post shared to ${userIds.length} users successfully`,
        data: {
          postId,
          sharedToCount: userIds.length,
          message
        }
      };
    } catch (error) {
      console.error('Error sharing post:', error);
      return {
        success: false,
        message: 'Error sharing post'
      };
    }
  }
}
