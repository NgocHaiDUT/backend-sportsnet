import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type Status = 'PENDING' | 'CONFIRMED' | 'REJECTED';

@Injectable()
export class OwnerBookingsService {
  constructor(private prisma: PrismaService) {}

  private async ensureOwnerBooking(ownerId: number, bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        bookingSlots: {
          include: {
            court: { include: { sportField: { include: { owner: true } } } },
          },
        },
        account: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    const belongsToOwner = booking.bookingSlots.some(
      (s) => s.court.sportField.ownerId === ownerId,
    );
    if (!belongsToOwner) throw new ForbiddenException('Not your booking');
    return booking;
  }

  async list(params: { ownerId: number; status?: string; fieldId?: number; date?: string }) {
    const { ownerId, status, fieldId, date } = params;

    // Build where clause
    const whereSlots: any = {
      court: { sportField: { ownerId } },
    };
    if (fieldId) whereSlots.court.sportField.id = fieldId;

    const whereBooking: any = {};
    if (status) whereBooking.status = status;

    // Optional date filter (naive UTC day boundaries)
    if (date) {
      const start = new Date(date);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      whereSlots.startTime = { gte: start, lt: end };
    }

    const bookings = await this.prisma.booking.findMany({
      where: {
        ...whereBooking,
        bookingSlots: { some: whereSlots },
      },
      include: {
        bookingSlots: { include: { court: { include: { sportField: true } } } },
        account: { select: { Id: true, Fullname: true, Email: true, Avatar: true, } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map((b) => ({
      id: b.id,
      createdAt: b.createdAt,
      totalPrice: b.totalPrice,
      status: b.status,
      user: b.account,
      slots: b.bookingSlots.map((s) => ({
        courtId: s.courtId,
        courtName: s.court.name,
        fieldId: s.court.sportFieldId,
        fieldName: s.court.sportField.name,
        startTime: s.startTime,
        endTime: s.endTime,
        price: s.price,
      })),
    }));
  }

  async detail(ownerId: number, bookingId: number) {
    const booking = await this.ensureOwnerBooking(ownerId, bookingId);
    const firstSlot = booking.bookingSlots[0];
    const fieldName = firstSlot?.court.sportField.name ?? null;
    const fieldAddress = firstSlot?.court.sportField.address ?? null;
    const ownerEmail = firstSlot?.court.sportField.owner?.Email ?? null;
    const totalHours = booking.bookingSlots.reduce((sum, s) => {
      const ms = new Date(s.endTime).getTime() - new Date(s.startTime).getTime();
      return sum + ms / 36e5;
    }, 0);
    return {
      id: booking.id,
      createdAt: booking.createdAt,
      totalPrice: booking.totalPrice,
      status: booking.status,
      paymentProof: booking.paymentProof,
      fieldName,
      fieldAddress,
      ownerEmail,
      totalHours,
      bookerName: booking.account.Fullname,
      bookerEmail: booking.account.Email,
      bookedPhone: booking.account.phone,
      
      user: {
        id: booking.account.Id,
        fullname: booking.account.Fullname,
        email: booking.account.Email,
        avatar: booking.account.Avatar,
      },
      slots: booking.bookingSlots.map((s) => ({
        courtId: s.courtId,
        courtName: s.court.name,
        fieldId: s.court.sportFieldId,
        fieldName: s.court.sportField.name,
        fieldAddress: booking.bookingSlots[0]?.court.sportField.address,
        startTime: s.startTime,
        endTime: s.endTime,
        price: s.price,
      })),
    };
  }

  async updateStatus(ownerId: number, bookingId: number, status: Status) {
    const allowed: Status[] = ['PENDING', 'CONFIRMED', 'REJECTED'];
    if (!allowed.includes(status)) throw new ForbiddenException('Invalid status');
    await this.ensureOwnerBooking(ownerId, bookingId);
    return this.prisma.booking.update({ where: { id: bookingId }, data: { status } });
  }

  async schedule(params: { ownerId: number; date?: string; fieldId?: number }) {
    const { ownerId, date, fieldId } = params;
    const where: any = {
      court: { sportField: { ownerId } },
    };
    if (fieldId) where.court.sportField.id = fieldId;
    if (date) {
      const start = new Date(date);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      where.startTime = { gte: start, lt: end };
    }
    const slots = await this.prisma.bookingSlot.findMany({
      where,
      include: {
        booking: { select: { id: true, status: true, User_id: true } },
        court: { include: { sportField: true } },
      },
      orderBy: { startTime: 'asc' },
    });
    return slots.map((s) => ({
      bookingId: s.bookingId,
      status: s.booking.status,
      userId: s.booking.User_id,
      courtId: s.courtId,
      courtName: s.court.name,
      fieldId: s.court.sportFieldId,
      fieldName: s.court.sportField.name,
      startTime: s.startTime,
      endTime: s.endTime,
      price: s.price,
    }));
  }
}
