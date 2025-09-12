// File: src/booking/booking.service.ts
import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { addHours,subHours, getDay, format, startOfDay, endOfDay } from 'date-fns';
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
    const clientTimezoneOffsetHours = 7;

    const startDate = subHours(startOfDay(date), clientTimezoneOffsetHours);
    const endDate = subHours(endOfDay(date), clientTimezoneOffsetHours);
    

    return this.prisma.bookingSlot.findMany({
      where: {
        court: { sportFieldId: sportFieldId },
        startTime: { 
          gte: startDate, // Lớn hơn hoặc bằng thời điểm bắt đầu ngày của người dùng (tính theo UTC)
          lte: endDate,   // Nhỏ hơn hoặc bằng thời điểm kết thúc ngày của người dùng (tính theo UTC)
        },
        booking: {
          status: { in: ['PENDING', 'CONFIRMED'] }, // Chỉ lấy các booking có trạng thái PENDING hoặc CONFIRMED
        },
      },
      select: { courtId: true, startTime: true },
    });
  }

  async updateBookingStatus(
    bookingId: number,
    dto: UpdateBookingStatusDto,
    ownerId: number,
  ) {
    console.log(`\n--- [BẮT ĐẦU GỠ LỖI] Cập nhật trạng thái cho Booking ID: ${bookingId} ---`);
    console.log(`Trạng thái mới được yêu cầu: "${dto.status}"`);

    // B1: Tìm booking, đảm bảo include account
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        account: { 
          select: { Id: true } // Chỉ cần lấy ID của người đặt
        },
        bookingSlots: {
          take: 1,
          include: {
            court: {
              include: { sportField: true },
            },
          },
        },
      },
    });

    if (!booking) {
      console.error("[LỖI] Không tìm thấy booking. Dừng lại.");
      throw new NotFoundException(`Không tìm thấy đơn đặt sân với ID ${bookingId}`);
    }

    // ... (Phần kiểm tra quyền giữ nguyên)
    const actualOwnerId = booking.bookingSlots[0]?.court.sportField.ownerId;
    if (actualOwnerId !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật đơn đặt sân này.');
    }

    // B3: Cập nhật trạng thái
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: dto.status,
      },
    });
    console.log("[OK] Đã cập nhật trạng thái booking trong DB thành công.");

    // B4 (QUAN TRỌNG): KIỂM TRA ĐIỀU KIỆN GỬI THÔNG BÁO
    console.log("\n--- [KIỂM TRA ĐIỀU KIỆN IF] ---");
    
    // Kiểm tra từng vế của điều kiện
    const condition1_updatedBooking = !!updatedBooking;
    const condition2_bookingAccount = !!booking.account;
    const condition3_statusMatch = (dto.status === 'CONFIRMED' || dto.status === 'REJECTED');

    console.log(`1. updatedBooking có tồn tại không?   -> ${condition1_updatedBooking}`);
    console.log(`2. booking.account có tồn tại không?    -> ${condition2_bookingAccount}`);
    console.log(`   (Chi tiết: booking.account = ${JSON.stringify(booking.account)})`);
    console.log(`3. Trạng thái có khớp không?           -> ${condition3_statusMatch}`);
    console.log(`   (So sánh "${dto.status}" với 'CONFIRMED' hoặc 'REJECTED')`);

    // Ghép các điều kiện lại
    if (condition1_updatedBooking && condition2_bookingAccount && condition3_statusMatch) {
      console.log("[KẾT QUẢ] ✅ ĐIỀU KIỆN ĐÚNG. Sẽ gọi hàm gửi thông báo.");
      
      const firstSlot = booking.bookingSlots[0];
      const details = {
          sportFieldName: firstSlot?.court.sportField.name || 'Sân của bạn',
          startTime: firstSlot ? format(new Date(firstSlot.startTime), 'HH:mm dd/MM/yyyy') : '',
          newStatus: updatedBooking.status,
      };

      await this.notificationService.notifyBookingStatusUpdate(
        booking.account!.Id, // Dùng ! vì đã kiểm tra ở trên
        ownerId,
        bookingId,
        details
      );
      console.log("[OK] Đã gọi hàm notifyBookingStatusUpdate.");

    } else {
      console.log("[KẾT QUẢ] ❌ ĐIỀU KIỆN SAI. Sẽ KHÔNG gửi thông báo.");
    }
    
    console.log("--- [KẾT THÚC GỠ LỖI] ---\n");
    return updatedBooking;
  }

  async createBooking(dto: CreateBookingDto, paymentProofUrl?: string) {
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
      const startTime = new Date(slot.startTime); // Lưu nguyên thời gian UTC
      const dayOfWeek = getDay(startTime);
      const courtPrices = priceMap.get(slot.courtId);
      if (!courtPrices) {
        throw new NotFoundException(`Không tìm thấy thông tin giá cho sân với ID: ${slot.courtId}`);
      }
      let currentPrice = (dayOfWeek === 0 || dayOfWeek === 6) ? courtPrices.weekend : courtPrices.weekday;
      finalTotalPrice += currentPrice;
      return {
        courtId: slot.courtId,
        startTime: startTime, // Lưu UTC
        endTime: addHours(startTime, 1),
        price: currentPrice,
      };
    });

    // --- BƯỚC 2: THỰC HIỆN TRANSACTION ĐỂ TẠO BOOKING ---
    const createdBooking = await this.prisma.$transaction(async (tx) => {
      const conflictSlots = await tx.bookingSlot.findMany({
  where: {
    // Điều kiện 1: Vẫn tìm các slot trùng thời gian và sân
    OR: dto.slots.map(slot => ({
      courtId: slot.courtId,
      startTime: new Date(slot.startTime),
    })),
    // Điều kiện 2 (MỚI): Thêm bộ lọc trên bảng booking liên quan
    booking: {
      status: {
        in: ['PENDING', 'CONFIRMED'], // Chỉ coi là trùng nếu status nằm trong danh sách này
      },
    },
  },
});

      if (conflictSlots.length > 0) {
        throw new ConflictException('Một hoặc nhiều khung giờ đã được người khác đặt.');
      }

      const newBooking = await tx.booking.create({
        data: {
          User_id: dto.userId,
          totalPrice: finalTotalPrice,
          status: 'PENDING',
          paymentProof: paymentProofUrl || null, // Lưu đường dẫn ảnh minh chứng nếu có
          note: dto.note || null, // Lưu ghi chú nếu có
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

  async savePaymentProof(bookingId: number, paymentProofUrl: string) {
    const booking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { paymentProof: paymentProofUrl },
    });

    if (!booking) {
      throw new Error('Booking not found or update failed');
    }

    return booking;
  }

  async getQrPaymentByOwner(ownerId: number) {
    const acc = await this.prisma.account.findUnique({
      where: { Id: Number(ownerId) },
      select: { Id: true, Role: true, QR_Payment: true },
    });
    if (!acc) return { success: false, message: 'User not found' };
    if (acc.Role !== 'OWNER') return { success: false, message: 'Only OWNER can have QR payment' };
    return { success: true, qrUrl: acc.QR_Payment ?? null };
  }

  async getQrPaymentByField(fieldId: number) {
    const field = await this.prisma.sportField.findUnique({
      where: { id: Number(fieldId) },
      include: { owner: { select: { QR_Payment: true } } },
    });
    const qrUrl = field?.owner?.QR_Payment ?? null;
    return { success: !!qrUrl, qrUrl };
  }

  async getQrPaymentByCourt(courtId: number) {
    const court = await this.prisma.court.findUnique({
      where: { id: Number(courtId) },
      include: { sportField: { include: { owner: { select: { QR_Payment: true } } } } },
    });
    const qrUrl = court?.sportField?.owner?.QR_Payment ?? null;
    return { success: !!qrUrl, qrUrl };
  }

  async getOwnerIdByField(fieldId: number): Promise<number | null> {
    const field = await this.prisma.sportField.findUnique({
      where: { id: Number(fieldId) },
      select: { ownerId: true },
    });
    return field?.ownerId ?? null;
  }

  async getOwnerIdByCourt(courtId: number): Promise<number | null> {
    const court = await this.prisma.court.findUnique({
      where: { id: Number(courtId) },
      select: { sportField: { select: { ownerId: true } } },
    });
    return court?.sportField?.ownerId ?? null;
  }
}