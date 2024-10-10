import { IsString, IsOptional } from 'class-validator';

export class CreateRecordDto {
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  createdBy?: string;
}