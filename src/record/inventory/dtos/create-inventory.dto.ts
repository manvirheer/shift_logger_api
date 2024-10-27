import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInventoryDto {
  @IsOptional()
  @IsString()
  shiftId?: string;

  @IsNumber()
  shiftReading: number;

  @IsOptional()
  @IsString()
  details?: string;

  @IsString()
  plantId: string; 
}