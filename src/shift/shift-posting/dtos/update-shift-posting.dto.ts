import { IsOptional, IsUUID } from 'class-validator';

export class UpdateShiftPostingDto {
  @IsOptional()
  @IsUUID()
  shiftScheduleId?: string;

  @IsOptional()
  @IsUUID()
  staffId?: string;
}
