import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ShiftType } from '../entities/shift-template.entity';

export class CreateShiftTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  defaultStartTime: string; // Format 'HH:mm:ss'

  @IsString()
  @IsNotEmpty()
  defaultEndTime: string; // Format 'HH:mm:ss'

  @IsEnum(ShiftType, { message: 'shiftType must be either Standard or Long' })
  @IsOptional()
  shiftType: ShiftType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  plantId: string;
}
