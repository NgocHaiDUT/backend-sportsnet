// File: src/owner/owner.module.ts (hoặc đường dẫn tương tự)

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OwnerFieldsController } from './owner-fields.controller.js';
import { OwnerFieldsService } from './owner-fields.service.js';
import { OwnerCourtsController } from './owner-courts.controller.js';
import { OwnerCourtsService } from './owner-courts.service.js';
import { OwnerBookingsController } from './owner-bookings.controller.js';
import { OwnerBookingsService } from './owner-bookings.service.js';

// THÊM CÁC DÒNG IMPORT NÀY
import { NotificationService } from '../notification/notification.service.js';
import { NotificationsGateway } from '../notification/notification.gateway.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    OwnerFieldsController,
    OwnerCourtsController,
    OwnerBookingsController,
  ],
  providers: [
    OwnerFieldsService,
    OwnerCourtsService,
    OwnerBookingsService,
    // THÊM 2 DÒNG NÀY VÀO CUỐI
    NotificationService,
    NotificationsGateway,
  ],
})
export class OwnerModule {}