import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateSteamGenerationDto {
  @IsEnum(['A', 'B', 'C'])
  shift: 'A' | 'B' | 'C';

  @IsNumber()
  initialReading: number;

  @IsNumber()
  finalReading: number;

  @IsNumber()
  steamGeneration: number;

  @IsOptional()
  @IsString()
  updatedBy?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  // Include the `createdBy` field from the base class
  @IsOptional()
  @IsString()
  createdBy?: string;
}
