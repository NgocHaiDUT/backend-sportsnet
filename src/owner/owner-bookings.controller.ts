import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { OwnerBookingsService } from './owner-bookings.service.js';

@Controller('owner')
export class OwnerBookingsController {
  constructor(private readonly service: OwnerBookingsService) {}

  @Get('bookings')
  list(
    @Query('ownerId') ownerId: string,
    @Query('status') status?: string,
    @Query('fieldId') fieldId?: string,
    @Query('date') date?: string,
  ) {
    return this.service.list({ ownerId: Number(ownerId), status, fieldId: fieldId ? Number(fieldId) : undefined, date });
  }

  @Get('bookings/:id')
  detail(@Param('id') id: string, @Query('ownerId') ownerId: string) {
    return this.service.detail(Number(ownerId), Number(id));
  }

  @Patch('bookings/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Query('ownerId') ownerId: string,
    @Body() body: { status: 'PENDING' | 'CONFIRMED' | 'REJECTED' },
  ) {
    return this.service.updateStatus(Number(ownerId), Number(id), body.status);
  }

  @Get('schedule')
  schedule(
    @Query('ownerId') ownerId: string,
    @Query('date') date?: string,
    @Query('fieldId') fieldId?: string,
  ) {
    return this.service.schedule({ ownerId: Number(ownerId), date, fieldId: fieldId ? Number(fieldId) : undefined });
  }
}
