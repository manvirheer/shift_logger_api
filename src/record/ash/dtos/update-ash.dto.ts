import { IsOptional, IsUUID, IsNumber } from 'class-validator';

export class UpdateAshDto {
  @IsUUID()
  @IsOptional()
  plantId?: string;

  @IsUUID()
  @IsOptional()
  shiftScheduleId?: string;

  @IsNumber()
  @IsOptional()
  ashGenerated?: number;
}
