import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateShiftPostingDto {
  @IsUUID()
  shiftScheduleId: string;

  @IsUUID()
  staffId: string;
}