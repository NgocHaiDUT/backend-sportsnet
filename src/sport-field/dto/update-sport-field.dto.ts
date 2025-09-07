import { PartialType } from '@nestjs/mapped-types';
import { CreateSportFieldDto } from './create-sport-field.dto';

export class UpdateSportFieldDto extends PartialType(CreateSportFieldDto) {}
