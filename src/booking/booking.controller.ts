// File: src/booking/booking.controller.ts
import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, Patch } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CustomParseDatePipe } from './pipes/custom-parse-date.pipe'; // Import Pipe mới
import { UpdateBookingStatusDto } from './dto/update-booking.dto';
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.createBooking(createBookingDto);
  }

  @Get('availability')
  getAvailability(
    @Query('sportFieldId', ParseIntPipe) sportFieldId: number,
    @Query('date', CustomParseDatePipe) date: Date, // SỬA ĐỔI Ở ĐÂY
  ) {
    return this.bookingService.getAvailability(sportFieldId, date);
  }

  @Get('history/:userId')
  getHistory(@Param('userId', ParseIntPipe) userId: number) {
    return this.bookingService.getBookingHistory(userId);
  }
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookingStatusDto: UpdateBookingStatusDto,
    // Sau này, ownerId sẽ được lấy từ JWT token của người đang đăng nhập
    // Tạm thời, chúng ta có thể gửi nó trong body để test
    // @Body('ownerId', ParseIntPipe) ownerId: number
  ) {
    const ownerId = 2; // <<--- TẠM THỜI HARDCODE ID CHỦ SÂN ĐỂ TEST
    return this.bookingService.updateBookingStatus(id, updateBookingStatusDto, ownerId);
  }
}