import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('user')
export class UserController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get(':id/phone')
  async getUserPhone(@Param('id') id: string) {
    const user = await this.prismaService.account.findUnique({
      where: { Id: Number(id) },
      select: { phone: true },
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    return { success: true, phone: user.phone };
  }
}
