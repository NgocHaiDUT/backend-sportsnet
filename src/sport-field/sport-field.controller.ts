// File: src/sport-field/sport-field.controller.ts
import { Controller, Get } from '@nestjs/common';
import { SportFieldService } from './sport-field.service';

@Controller('sport-fields') // Đặt tên endpoint là 'sport-fields'
export class SportFieldController {
  constructor(private readonly sportFieldService: SportFieldService) {}

  @Get()
  findAll() {
    return this.sportFieldService.findAll();
  }
}