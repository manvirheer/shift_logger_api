// shift-end/dtos/update-shift-end-entry.dto.ts

import { IsString, IsNumber, IsUUID, IsOptional } from 'class-validator';

export class UpdateShiftEndEntryDto {
  @IsUUID()
  id: string;

  @IsUUID()
  @IsOptional()
  shiftScheduleId?: string;

  @IsUUID()
  @IsOptional()
  plantId?: string;

  @IsNumber()
  @IsOptional()
  briquetteConsumption?: number;

  @IsNumber()
  @IsOptional()
  ashGenerated?: number;

  @IsNumber()
  @IsOptional()
  steamGenerationInitialReading?: number;

  @IsNumber()
  @IsOptional()
  steamGenerationFinalReading?: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}
