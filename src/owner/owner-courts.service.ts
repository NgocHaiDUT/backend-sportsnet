import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OwnerCourtsService {
  constructor(private prisma: PrismaService) {}

  async ensureOwnerField(ownerId: number, fieldId: number) {
    const sf = await this.prisma.sportField.findUnique({ where: { id: fieldId } });
    if (!sf) throw new NotFoundException('Sport field not found');
    if (sf.ownerId !== ownerId) throw new ForbiddenException('Not your field');
    return sf;
  }

  async list(ownerId: number, fieldId: number) {
    await this.ensureOwnerField(ownerId, fieldId);
    return this.prisma.court.findMany({ where: { sportFieldId: fieldId } });
  }

  async create(fieldId: number, dto: { ownerId: number; name: string; weekdayPrice: number; weekendPrice: number }) {
    await this.ensureOwnerField(dto.ownerId, fieldId);
    return this.prisma.court.create({
      data: { name: dto.name, sportFieldId: fieldId, weekdayPrice: dto.weekdayPrice, weekendPrice: dto.weekendPrice },
    });
  }

  async update(id: number, dto: { ownerId: number; name?: string; weekdayPrice?: number; weekendPrice?: number }) {
    const court = await this.prisma.court.findUnique({ where: { id }, include: { sportField: true } });
    if (!court) throw new NotFoundException('Court not found');
    if (court.sportField.ownerId !== dto.ownerId) throw new ForbiddenException('Not your field');
    const { ownerId, ...data } = dto;
    return this.prisma.court.update({ where: { id }, data });
  }

  async remove(ownerId: number, id: number) {
    const court = await this.prisma.court.findUnique({ where: { id }, include: { sportField: true, bookingSlots: true } });
    if (!court) throw new NotFoundException('Court not found');
    if (court.sportField.ownerId !== ownerId) throw new ForbiddenException('Not your field');
    if (court.bookingSlots.length > 0) throw new ForbiddenException('Court has bookings');
    await this.prisma.court.delete({ where: { id } });
    return { success: true };
  }
}
