import { IsNotEmpty, IsUUID, IsNumber } from 'class-validator';

export class CreateAshDto {
  @IsUUID()
  @IsNotEmpty()
  plantId: string;

  @IsUUID()
  @IsNotEmpty()
  shiftScheduleId: string;

  @IsNumber()
  @IsNotEmpty()
  ashGenerated: number;
}
