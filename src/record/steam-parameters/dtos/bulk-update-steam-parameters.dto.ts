// src/record/steam-parameters/dtos/bulk-update-steam-parameters.dto.ts

import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateSteamParametersDto } from './update-steam-parameters.dto';

export class BulkUpdateSteamParametersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSteamParametersDto)
  updates: UpdateSteamParametersDto[];
}
