import { IsUUID, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSteamGenerationDto {
  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  plantId?: string; 

  @IsOptional()
  @IsString()
  shiftId?: string;

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
