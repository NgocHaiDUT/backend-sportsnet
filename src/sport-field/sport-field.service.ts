import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SportFieldService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.sportField.findMany({
      include: {
        // Bao gồm cả thông tin về các sân con và giá của chúng
        courts: {
          select: {
            id: true, // Thêm id
            name: true,// Thêm trường name
            weekdayPrice: true,
            weekendPrice: true,
          },
        },
      },
    });
  }
}