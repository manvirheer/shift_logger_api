import { IsUUID, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSteamGenerationDto {
  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  plantId?: string; // Placeholder

  @IsOptional()
  @IsString()
  shiftId?: string; // Placeholder

  @IsOptional()
  @IsNumber()
  initialReading?: number;

  @IsOptional()
  @IsNumber()
  finalReading?: number;

  @IsOptional()
  @IsString()
  updatedBy?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
