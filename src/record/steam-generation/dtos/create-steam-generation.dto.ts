import { IsUUID, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSteamGenerationDto {
  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  plantId?: string; // Placeholder

  @IsOptional()
  @IsString()
  shiftId?: string; // Placeholder

  @IsNumber()
  initialReading: number;

  @IsNumber()
  finalReading: number;

  @IsOptional()
  @IsString()
  updatedBy?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
