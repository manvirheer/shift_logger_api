import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSteamGenerationDto {
  @IsOptional()
  @IsString()
  shiftId?: string;

  @IsOptional()
  @IsNumber()
  initialReading?: number;

  @IsOptional()
  @IsNumber()
  finalReading?: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
