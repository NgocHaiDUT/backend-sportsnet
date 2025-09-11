// File: src/sport-field/sport-field.controller.ts
import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { SportFieldService } from './sport-field.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('sport-fields') // Đặt tên endpoint là 'sport-fields'
export class SportFieldController {
  constructor(
    private readonly sportFieldService: SportFieldService,
    private readonly prismaService: PrismaService
  ) {}

  @Get()
  findAll() {
    return this.sportFieldService.findAll();
  }

  @Get(':id/owner-phone')
  async getOwnerPhone(@Param('id') sportFieldId: string) {
    const sportField = await this.prismaService.sportField.findUnique({
      where: { id: Number(sportFieldId) },
      select: {
        owner: {
          select: {
            phone: true,
          },
        },
      },
    });

    if (!sportField || !sportField.owner) {
      return { success: false, message: 'Sport field or owner not found' };
    }

    return { success: true, phone: sportField.owner.phone };
  }

  // ===== REVIEW ENDPOINTS =====

  @Get(':id/reviews')
  async getReviews(@Param('id', ParseIntPipe) sportFieldId: number) {
    try {
      const reviews = await this.prismaService.sportFieldReview.findMany({
        where: { sportFieldId },
        include: {
          user: {
            select: {
              Id: true,
              Fullname: true,
              Avatar: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const mappedReviews = reviews.map(review => ({
        id: review.id,
        userId: review.userId,
        sportFieldId: review.sportFieldId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: {
          id: review.user.Id,
          fullname: review.user.Fullname,
          avatar: review.user.Avatar,
        }
      }));

      return { success: true, data: mappedReviews };
    } catch (error) {
      console.error('Get reviews error:', error);
      return { success: false, message: 'Không thể lấy danh sách đánh giá' };
    }
  }

  @Post('reviews')
  async createReview(@Body() reviewData: {
    userId: number;
    sportFieldId: number;
    rating: number;
    comment?: string;
  }) {
    try {
      // Check if user already reviewed this sport field
      const existingReview = await this.prismaService.sportFieldReview.findUnique({
        where: {
          userId_sportFieldId: {
            userId: reviewData.userId,
            sportFieldId: reviewData.sportFieldId
          }
        }
      });

      if (existingReview) {
        return { success: false, message: 'Bạn đã đánh giá sân này rồi' };
      }

      // Validate rating
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        return { success: false, message: 'Đánh giá phải từ 1 đến 5 sao' };
      }

      // Create review
      const review = await this.prismaService.sportFieldReview.create({
        data: {
          userId: reviewData.userId,
          sportFieldId: reviewData.sportFieldId,
          rating: reviewData.rating,
          comment: reviewData.comment || null,
        }
      });

      return { success: true, data: review, message: 'Đánh giá đã được tạo thành công' };
    } catch (error) {
      console.error('Create review error:', error);
      return { success: false, message: 'Không thể tạo đánh giá' };
    }
  }

  @Get(':id/rating')
  async getAverageRating(@Param('id', ParseIntPipe) sportFieldId: number) {
    try {
      const result = await this.prismaService.sportFieldReview.aggregate({
        where: { sportFieldId },
        _avg: { rating: true },
        _count: { id: true }
      });

      return {
        success: true,
        data: {
          averageRating: Number((result._avg.rating || 0).toFixed(1)),
          totalReviews: result._count.id
        }
      };
    } catch (error) {
      console.error('Get average rating error:', error);
      return { success: false, message: 'Không thể lấy thông tin đánh giá' };
    }
  }

  @Get(':id/reviews/check/:userId')
  async checkUserReviewed(
    @Param('id', ParseIntPipe) sportFieldId: number,
    @Param('userId', ParseIntPipe) userId: number
  ) {
    try {
      const review = await this.prismaService.sportFieldReview.findUnique({
        where: {
          userId_sportFieldId: {
            userId,
            sportFieldId
          }
        }
      });

      return {
        success: true,
        data: { hasReviewed: !!review }
      };
    } catch (error) {
      console.error('Check user reviewed error:', error);
      return { success: false, message: 'Không thể kiểm tra trạng thái đánh giá' };
    }
  }
}