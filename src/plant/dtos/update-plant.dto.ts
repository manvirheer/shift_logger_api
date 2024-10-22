import { IsString, IsOptional } from 'class-validator';

export class UpdatePlantDto {
  @IsOptional()
  @IsString()
  plantName?: string;

  @IsOptional()
  @IsString()
  plantAddress?: string;

  @IsOptional()
  @IsString()
  plantContactPerson?: string;
}