import { IsOptional, IsString } from 'class-validator';

export class CreateActivityDto {
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

  @IsString()
  activityDetails: string;
}
