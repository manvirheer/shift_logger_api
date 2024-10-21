import { IsOptional, IsString } from 'class-validator';

export class UpdateActivityDto {
  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;

  @IsOptional()
  @IsString()
  shiftId?: string; // Placeholder

  @IsOptional()
  @IsString()
  plantId?: string; // Placeholder

  @IsOptional()
  @IsString()
  activityDetails?: string;
}
