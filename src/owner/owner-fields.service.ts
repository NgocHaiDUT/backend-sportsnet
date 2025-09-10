import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OwnerFieldsService {
  constructor(private prisma: PrismaService) {}

  list(ownerId: number) {
    return this.prisma.sportField.findMany({ where: { ownerId } });
  }

  async create(dto: { ownerId: number; name: string; address: string; city: string; district: string; sport: string }) {
    return this.prisma.sportField.create({ data: dto });
  }

  async detail(ownerId: number, id: number) {
    const sf = await this.prisma.sportField.findUnique({ where: { id } , include: { courts: true }});
    if (!sf) throw new NotFoundException('Sport field not found');
    if (sf.ownerId !== ownerId) throw new ForbiddenException('Not your field');
    return sf;
  }

  async update(id: number, dto: { ownerId: number; name?: string; address?: string; city?: string; district?: string; sport?: string }) {
    const sf = await this.prisma.sportField.findUnique({ where: { id } });
    if (!sf) throw new NotFoundException('Sport field not found');
    if (sf.ownerId !== dto.ownerId) throw new ForbiddenException('Not your field');
    const { ownerId, ...data } = dto;
    return this.prisma.sportField.update({ where: { id }, data });
  }

  async remove(ownerId: number, id: number) {
    const sf = await this.prisma.sportField.findUnique({ where: { id } , include: { courts: true }});
    if (!sf) throw new NotFoundException('Sport field not found');
    if (sf.ownerId !== ownerId) throw new ForbiddenException('Not your field');
    if (sf.courts.length > 0) throw new ForbiddenException('Remove courts first');
    await this.prisma.sportField.delete({ where: { id } });
    return { success: true };
  }
}
