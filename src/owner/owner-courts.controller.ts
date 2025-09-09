import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { OwnerCourtsService } from './owner-courts.service.js';

@Controller('owner')
export class OwnerCourtsController {
  constructor(private readonly service: OwnerCourtsService) {}

  @Get('fields/:fieldId/courts')
  list(@Param('fieldId') fieldId: string, @Query('ownerId') ownerId: string) {
    return this.service.list(Number(ownerId), Number(fieldId));
  }

  @Post('fields/:fieldId/courts')
  create(
    @Param('fieldId') fieldId: string,
    @Body() dto: { ownerId: number; name: string; weekdayPrice: number; weekendPrice: number },
  ) {
    return this.service.create(Number(fieldId), dto);
  }

  @Patch('courts/:id')
  update(
    @Param('id') id: string,
    @Body() dto: { ownerId: number; name?: string; weekdayPrice?: number; weekendPrice?: number },
  ) {
    return this.service.update(Number(id), dto);
  }

  @Delete('courts/:id')
  remove(@Param('id') id: string, @Query('ownerId') ownerId: string) {
    return this.service.remove(Number(ownerId), Number(id));
  }
}
