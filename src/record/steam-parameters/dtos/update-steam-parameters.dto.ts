// src/record/steam-parameters/dtos/update-steam-parameters.dto.ts

import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class UpdateSteamParametersDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsOptional()
  @IsString()
  timeStart?: string;

  @IsOptional()
  @IsString()
  timeEnd?: string;

  @IsOptional()
  @IsNumber()
  steamPressure?: number;

  @IsOptional()
  @IsNumber()
  steamFlow?: number;

  @IsOptional()
  @IsNumber()
  steamTemperature?: number;

  @IsOptional()
  @IsNumber()
  elMeter?: number;

  @IsOptional()
  @IsNumber()
  stackTemperature?: number;

  @IsOptional()
  @IsNumber()
  feedWaterTemperature?: number;

  @IsOptional()
  @IsNumber()
  feedWaterMeterReading?: number;

  @IsOptional()
  @IsNumber()
  fuelPumpPr?: number;

  @IsOptional()
  @IsNumber()
  fuelPumpRtPr?: number;

  @IsOptional()
  @IsNumber()
  filterNumber?: number;

  @IsOptional()
  @IsNumber()
  feedWaterPr?: number;

  @IsOptional()
  @IsNumber()
  feedWaterPh?: number;

  @IsOptional()
  @IsNumber()
  blowDownPh?: number;

  @IsOptional()
  @IsNumber()
  blowDownTds?: number;

  @IsOptional()
  @IsNumber()
  feedWaterTds?: number;
}
