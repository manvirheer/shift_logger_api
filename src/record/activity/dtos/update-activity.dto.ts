import { IsOptional, IsString } from 'class-validator';

export class UpdateActivityDto {

  @IsOptional()
  @IsString()
  plantId?: string; 

  @IsOptional()
  @IsString()
  shiftId?: string; 
  
  @IsOptional()
  @IsString()
  activityDetails?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
