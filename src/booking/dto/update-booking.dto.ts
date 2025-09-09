// File: src/booking/dto/update-booking.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';

// Định nghĩa các trạng thái hợp lệ mà một booking có thể có
export enum BookingStatus {
  CONFIRMED = 'CONFIRMED', // Đã xác nhận
  CANCELLED = 'REJECTED', // Đã hủy (bởi chủ sân hoặc người dùng)
}

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  @IsNotEmpty()
  status: BookingStatus;
}