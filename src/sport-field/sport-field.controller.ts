// File: src/sport-field/sport-field.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { SportFieldService } from './sport-field.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('sport-fields') // Đặt tên endpoint là 'sport-fields'
export class SportFieldController {
  constructor(
    private readonly sportFieldService: SportFieldService,
    private readonly prismaService: PrismaService
  ) {}

  @Get()
  findAll() {
    return this.sportFieldService.findAll();
  }

  @Get(':id/owner-phone')
  async getOwnerPhone(@Param('id') sportFieldId: string) {
    const sportField = await this.prismaService.sportField.findUnique({
      where: { id: Number(sportFieldId) },
      select: {
        owner: {
          select: {
            phone: true,
          },
        },
      },
    });

    if (!sportField || !sportField.owner) {
      return { success: false, message: 'Sport field or owner not found' };
    }

    return { success: true, phone: sportField.owner.phone };
  }
}