import { IsString, IsNumber, IsUUID, IsOptional } from 'class-validator';

export class ShiftEndEntryDto {
  @IsUUID()
  shiftScheduleId: string;

  @IsNumber()
  briquetteConsumption: number;

  @IsUUID()
  plantId: string;

  @IsNumber()
  ashGenerated: number;

  @IsNumber()
  steamGenerationInitialReading: number;

  @IsNumber()
  steamGenerationFinalReading: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}
