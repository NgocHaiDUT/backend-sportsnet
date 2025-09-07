// File: src/booking/booking.service.ts
import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { addHours, getDay, format, startOfDay, endOfDay } from 'date-fns';
import { NotificationService } from '../notification/notification.service'; // SỬA: trỏ tới gateway notification hiện có của bạn
import { UpdateBookingStatusDto } from './dto/update-booking.dto';
@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    // Tiêm NotificationService thay vì Gateway
    private notificationService: NotificationService, 
  ) {}

  async getAvailability(sportFieldId: number, date: Date) {
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    return this.prisma.bookingSlot.findMany({
      where: {
        court: { sportFieldId: sportFieldId },
        startTime: { gte: startDate, lte: endDate },
      },
      select: { courtId: true, startTime: true },
    });
  }

  async updateBookingStatus(
    bookingId: number,
    dto: UpdateBookingStatusDto,
    ownerId: number, // ID của chủ sân đang thực hiện hành động
  ) {
    // B1: Tìm booking cần cập nhật
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        bookingSlots: {
          include: {
            court: {
              include: {
                sportField: true, // Lấy thông tin khu sân để kiểm tra quyền sở hữu
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đơn đặt sân với ID ${bookingId}`);
    }

    // B2: KIỂM TRA QUYỀN: Đảm bảo người cập nhật chính là chủ của sân đó
    const actualOwnerId = booking.bookingSlots[0]?.court.sportField.ownerId;
    if (actualOwnerId !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền xác nhận đơn đặt sân này.');
    }

    // B3: Cập nhật trạng thái
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: dto.status,
      },
    });

    // B4 (Quan trọng): Gửi thông báo cho người dùng
    // TODO: Gọi NotificationService để thông báo cho người dùng rằng
    // đơn đặt của họ đã được xác nhận hoặc bị hủy.
    // Ví dụ: await this.notificationService.notifyBookingStatusUpdate(...)
    
    return updatedBooking;
  }

  async createBooking(dto: CreateBookingDto) {
    // --- BƯỚC 1: TÍNH TOÁN GIÁ CẢ ---
    const courtIds = [...new Set(dto.slots.map(slot => slot.courtId))];
    const courtsWithPricing = await this.prisma.court.findMany({
      where: { id: { in: courtIds } },
      select: { id: true, weekdayPrice: true, weekendPrice: true },
    });

    const priceMap = new Map(courtsWithPricing.map(c => [c.id, { weekday: c.weekdayPrice, weekend: c.weekendPrice }]));
    if (courtsWithPricing.length !== courtIds.length) {
      throw new NotFoundException('Một hoặc nhiều sân không hợp lệ.');
    }

    let finalTotalPrice = 0;
    const slotsWithPriceData = dto.slots.map(slot => {
      const startTime = new Date(new Date(slot.startTime).getTime() + 7 * 60 * 60 * 1000); // Chuyển từ UTC sang GMT+7
      const dayOfWeek = getDay(startTime);
      const courtPrices = priceMap.get(slot.courtId);
      if (!courtPrices) {
        throw new NotFoundException(`Không tìm thấy thông tin giá cho sân với ID: ${slot.courtId}`);
      }
      let currentPrice = (dayOfWeek === 0 || dayOfWeek === 6) ? courtPrices.weekend : courtPrices.weekday;
      finalTotalPrice += currentPrice;
      return {
        courtId: slot.courtId,
        startTime: startTime,
        endTime: addHours(startTime, 1),
        price: currentPrice,
      };
    });

    // --- BƯỚC 2: THỰC HIỆN TRANSACTION ĐỂ TẠO BOOKING ---
    const createdBooking = await this.prisma.$transaction(async (tx) => {
      const conflictSlots = await tx.bookingSlot.findMany({
        where: { OR: dto.slots.map(slot => ({ courtId: slot.courtId, startTime: new Date(slot.startTime) })) },
      });

      if (conflictSlots.length > 0) {
        throw new ConflictException('Một hoặc nhiều khung giờ đã được người khác đặt.');
      }

      const newBooking = await tx.booking.create({
        data: {
          User_id: dto.userId,
          totalPrice: finalTotalPrice,
          status: 'PENDING_PAYMENT',
        },
      });

      await tx.bookingSlot.createMany({
        data: slotsWithPriceData.map(slot => ({ ...slot, bookingId: newBooking.id })),
      });
      
      return tx.booking.findUnique({
        where: { id: newBooking.id },
        include: {
          account: { select: { Fullname: true } },
          bookingSlots: {
            take: 1,
            include: {
              court: {
                include: {
                  sportField: { select: { name: true, ownerId: true } },
                },
              },
            },
          },
        },
      });
    });

    // --- BƯỚC 3: GỬI THÔNG BÁO (Sau khi transaction đã thành công) ---
   if (createdBooking && createdBooking.bookingSlots.length > 0) {
      // 1. Lấy thông tin người đặt (actor) từ dto.userId
      const actor = await this.prisma.account.findUnique({
        where: { Id: dto.userId },
        select: { Fullname: true },
      });

      if (!actor) {
        console.error(`Không tìm thấy người dùng với ID: ${dto.userId} để tạo thông báo.`);
        return createdBooking; // Vẫn trả về booking thành công nhưng không gửi thông báo
      }
      const actorName = actor.Fullname;

      // 2. Lấy các thông tin còn lại từ booking đã tạo
      const ownerId = createdBooking.bookingSlots[0].court.sportField.ownerId;
      const details = {
        courtName: createdBooking.bookingSlots[0].court.name,
        sportFieldName: createdBooking.bookingSlots[0].court.sportField.name,
        startTime: format(createdBooking.bookingSlots[0].startTime, 'HH:mm'),
      };

      // 3. Gọi NotificationService với dữ liệu chính xác (chủ sân)
      await this.notificationService.notifyNewBooking(
        ownerId,        // Người nhận: Chủ sân
        dto.userId,     // Người thực hiện: Người dùng
        actorName,      // Tên người thực hiện: Tên của người dùng
        createdBooking.id,
        details
      );

      // 4. Gửi thông báo cho chính người đặt sân (user)
      const userDetails = {
        courtName: createdBooking.bookingSlots[0].court.name,
        sportFieldName: createdBooking.bookingSlots[0].court.sportField.name,
        date: format(createdBooking.bookingSlots[0].startTime, 'dd/MM/yyyy'),
        startTime: format(createdBooking.bookingSlots[0].startTime, 'HH:mm'),
        endTime: format(createdBooking.bookingSlots[0].endTime, 'HH:mm'),
        totalPrice: createdBooking.totalPrice,
        status: createdBooking.status,
      };

      await this.notificationService.notifyBookingCreatedForUser(
        dto.userId,
        createdBooking.id,
        userDetails,
      );
    }
    
    return createdBooking;
  }

  async getBookingHistory(userId: number) {
    return this.prisma.booking.findMany({
      where: { User_id: userId },
      include: { bookingSlots: { include: { court: { include: { sportField: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }


}