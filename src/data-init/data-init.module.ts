// File: src/data-init/data-init.module.ts
import { Module } from '@nestjs/common';
import { DataInitService } from './data-init.service';
import { PrismaModule } from '../prisma/prisma.module'; // THÊM DÒNG NÀY

@Module({
  imports: [PrismaModule], // THÊM DÒNG NÀY
  providers: [DataInitService],
})
export class DataInitModule {}