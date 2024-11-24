import {
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ShiftStatus } from '../entities/shift-schedule.entity';

export class UpdateShiftScheduleDto {
  @IsOptional()
  @IsUUID('4', { message: 'Invalid shiftTemplateId format' })
  shiftTemplateId?: string;

  @IsOptional()
  @IsDateString(undefined, {
    message: 'startTime must be in YYYY-MM-DDTHH:mm:ssZ format (24-hour)',
  })
  startTime?: string;

  @IsOptional()
  @IsDateString(undefined, {
    message: 'endTime must be in YYYY-MM-DDTHH:mm:ssZ format (24-hour)',
  })
  endTime?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Invalid plantId format' })
  plantId?: string;

  @IsOptional()
  @IsString()
  shiftTitle?: string;

  @IsOptional()
  @IsDateString(undefined, { message: 'date must be in YYYY-MM-DD format' })
  date?: string;

  @IsOptional()
  @IsEnum(ShiftStatus, { message: 'status must be one of Planned, Attended, Changed' })
  status?: string; // To allow status updates if needed

  @IsOptional()
  @IsString()
  statusDescription?: string; // Optional description for status changes
}
