import { IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateInventoryDto {
  @IsOptional()
  @IsString()
  shiftId?: string;

  @IsOptional()
  @IsNumber()
  shiftReading?: number;

  @IsOptional()
  @IsString()
  plantId?: string;

  @IsOptional()
  @IsString()
  details?: string;
}
