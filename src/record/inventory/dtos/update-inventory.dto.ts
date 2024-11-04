import { IsOptional, IsString, IsNumber, IsUUID } from 'class-validator';

export class UpdateInventoryRecordDto {
  @IsUUID()
  @IsOptional()
  plantId?: string;

  @IsUUID()
  @IsOptional()
  shiftScheduleId?: string;

  @IsString()
  @IsOptional()
  recordDate?: string;

  @IsString()
  @IsOptional()
  recordTime?: string;

  @IsNumber()
  @IsOptional()
  initialValue?: number;

  @IsString()
  @IsOptional()
  recordType?: string;

  @IsNumber()
  @IsOptional()
  consumption?: number;

  @IsNumber()
  @IsOptional()
  addition?: number;

  @IsString()
  @IsOptional()
  details?: string;
}
