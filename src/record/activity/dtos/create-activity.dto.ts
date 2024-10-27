import { IsOptional, IsString } from 'class-validator';

export class CreateActivityDto {
  
  @IsString()
  plantId: string;  // The client will still send this

  @IsOptional()
  @IsString()
  shiftId?: string;

  @IsString()
  activityDetails: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
