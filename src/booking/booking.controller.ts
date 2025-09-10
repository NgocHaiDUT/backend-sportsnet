// File: src/booking/booking.controller.ts
import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, Patch, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CustomParseDatePipe } from './pipes/custom-parse-date.pipe'; // Import Pipe mới
import { UpdateBookingStatusDto } from './dto/update-booking.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/bookings',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async create(
    @Body('createBookingDto') createBookingDtoString: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!createBookingDtoString) {
      throw new Error('createBookingDto is missing');
    }
    const createBookingDto: CreateBookingDto = JSON.parse(createBookingDtoString);

    const paymentProofUrl = file
      ? `/uploads/bookings/${file.filename}`
      : undefined;
    return this.bookingService.createBooking(createBookingDto, paymentProofUrl);
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

  @Post('upload-payment-proof')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/bookings',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadPaymentProof(
    @UploadedFile() file: Express.Multer.File,
    @Body('bookingId') bookingId: number, // Nhận bookingId từ frontend
  ) {
    if (!file) {
      throw new Error('File upload failed');
    }
    const fileUrl = `/uploads/bookings/${file.filename}`;
    console.log('File URL:', fileUrl);

    // Gọi hàm lưu đường dẫn vào cơ sở dữ liệu
    await this.bookingService.savePaymentProof(bookingId, fileUrl);

    return { url: fileUrl };
  }

  @Get('qr-payment')
  getQrPayment(@Query('ownerId') ownerId: string) {
    return this.bookingService.getQrPaymentByOwner(Number(ownerId));
  }

  // Tùy chọn: lấy QR theo field
  // GET /profile/qr-by-field/:fieldId
  @Get('qr-by-field/:fieldId')
  getQrByField(@Param('fieldId') fieldId: string) {
    return this.bookingService.getQrPaymentByField(Number(fieldId));
  }

  // Tùy chọn: lấy QR theo court
  // GET /profile/qr-by-court/:courtId
  @Get('qr-by-court/:courtId')
  getQrByCourt(@Param('courtId') courtId: string) {
    return this.bookingService.getQrPaymentByCourt(Number(courtId));
  }
}