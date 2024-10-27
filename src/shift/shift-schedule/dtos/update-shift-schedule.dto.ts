import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ShiftTitle } from '../entities/shift-schedule.entity';

export class UpdateShiftScheduleDto {
  @IsOptional()
  @IsEnum(ShiftTitle)
  shiftTitle?: ShiftTitle;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsUUID()
  plantId?: string;
}