import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ShiftType } from '../entities/shift-template.entity';

export class UpdateShiftTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  defaultStartTime?: string;

  @IsOptional()
  @IsString()
  defaultEndTime?: string;

  @IsOptional()
  @IsEnum(ShiftType, { message: 'shiftType must be either Standard or Long' })
  shiftType?: ShiftType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  plantId?: string;
}
