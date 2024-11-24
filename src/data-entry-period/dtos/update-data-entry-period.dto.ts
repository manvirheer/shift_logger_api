// src/data-entry-period/dtos/update-data-entry-period.dto.ts
import { IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class UpdateDataEntryPeriodDto {
  @IsOptional()
  @IsString()
  periodCode?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'startTime must be in HH:mm:ss format',
  })
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'endTime must be in HH:mm:ss format',
  })
  endTime?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  plantId?: string;
}
