// src/data-entry-period/dtos/create-data-entry-period.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class CreateDataEntryPeriodDto {
  @IsString()
  @IsNotEmpty()
  periodCode: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'startTime must be in HH:mm:ss format',
  })
  startTime: string; // Format: 'HH:mm:ss'

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'endTime must be in HH:mm:ss format',
  })
  endTime: string; // Format: 'HH:mm:ss'

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  plantId: string;
}
