// File: src/booking/booking.module.ts
import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { NotificationModule } from '../notification/notification.module'; // SỬA LẠI ĐƯỜNG DẪN
import { PrismaModule } from '../prisma/prisma.module'; // Đường dẫn có thể khác
@Module({
    imports: [PrismaModule, NotificationModule], // Thêm module notification vào đây
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}