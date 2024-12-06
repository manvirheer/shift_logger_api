import { IsNotEmpty, IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateInventoryRecordDto {
  @IsUUID()
  @IsNotEmpty()
  plantId: string;

  @IsUUID()
  @IsNotEmpty()
  shiftScheduleId: string;

  @IsString()
  @IsNotEmpty()
  recordDate: string;

  @IsString()
  @IsNotEmpty()
  recordTime: string;

  @IsString()
  recordType?: string;

  @IsNumber()
  @IsOptional()
  initialValue?: number;

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
