import { IsString } from 'class-validator';

export class CreatePlantDto {

  @IsString()
  plantName: string;

  @IsString()
  plantAddress: string;

  @IsString()
  plantContactPerson: string;
}