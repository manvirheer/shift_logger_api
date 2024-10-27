import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSteamGenerationDto {
  @IsString()
  plantId: string;  

  @IsString()
  shiftId: string; // Made required

  @IsNumber()
  initialReading: number;

  @IsNumber()
  finalReading: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
