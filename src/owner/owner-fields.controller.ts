import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { OwnerFieldsService } from './owner-fields.service.js';

@Controller('owner/fields')
export class OwnerFieldsController {
  constructor(private readonly service: OwnerFieldsService) {}

  @Get()
  list(@Query('ownerId') ownerId: string) {
    return this.service.list(Number(ownerId));
  }

  @Post()
  create(@Body() dto: { ownerId: number; name: string; address: string; city: string; district: string; sport: string }) {
    return this.service.create(dto);
  }

  @Get(':id')
  detail(@Param('id') id: string, @Query('ownerId') ownerId: string) {
    return this.service.detail(Number(ownerId), Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: { ownerId: number; name?: string; address?: string; city?: string; district?: string; sport?: string }) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('ownerId') ownerId: string) {
    return this.service.remove(Number(ownerId), Number(id));
  }
}
