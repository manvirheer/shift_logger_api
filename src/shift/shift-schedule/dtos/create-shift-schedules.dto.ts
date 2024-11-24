import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateShiftSchedulesDto {
  @IsUUID()
  @IsNotEmpty()
  plantId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string; // Format: 'YYYY-MM-DD'
}
