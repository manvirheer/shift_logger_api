import { PartialType } from '@nestjs/mapped-types';
import { CreateSteamGenerationDto } from './create_steam_generation.dto';

export class UpdateSteamGenerationDto extends PartialType(CreateSteamGenerationDto) {}