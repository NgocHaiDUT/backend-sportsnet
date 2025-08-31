import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import type { CreateNotificationDto } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('create')
  async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.createNotification(createNotificationDto);
  }

  @Get('user/:userId')
  async getUserNotifications(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationService.getUserNotifications(userId);
  }

  @Get('user/:userId/unread-count')
  async getUnreadCount(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationService.getUnreadCount(userId);
  }

  @Put(':notificationId/read/:userId')
  async markAsRead(
    @Param('notificationId', ParseIntPipe) notificationId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.notificationService.markAsRead(notificationId, userId);
  }

  @Put('user/:userId/read-all')
  async markAllAsRead(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationService.markAllAsRead(userId);
  }
}