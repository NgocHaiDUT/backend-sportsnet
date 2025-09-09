// File: src/booking/dto/create-booking.dto.ts
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SelectedSlotDto {
  @IsInt()
  @IsNotEmpty()
  courtId: number;

  @IsString()
  @IsNotEmpty()
  startTime: string; // Chuỗi ISO: "2024-09-05T09:00:00.000Z" (UTC, cần chuyển đổi sang GMT+7 khi hiển thị)
}

export class CreateBookingDto {
  @IsInt()
  @IsNotEmpty()
  userId: number; // Lấy từ token xác thực sau này

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedSlotDto)
  slots: SelectedSlotDto[];

  @IsOptional()
  @IsString()
  note?: string; // Added optional note field
}