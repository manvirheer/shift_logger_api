import { IsDateString, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ShiftTitle } from '../entities/shift-schedule.entity';

export class CreateShiftScheduleDto {
  @IsEnum(ShiftTitle)
  shiftTitle: ShiftTitle;

  @IsDateString()
  date: string; // The date of the shift

  @IsString()
  @IsNotEmpty()
  startTime: string; // Format 'HH:mm:ss'

  @IsString()
  @IsNotEmpty()
  endTime: string; // Format 'HH:mm:ss'

  @IsUUID()
  plantId: string;
}
