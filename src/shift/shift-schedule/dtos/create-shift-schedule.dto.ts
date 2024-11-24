import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  ValidateIf,
} from 'class-validator';

export class CreateShiftScheduleDto {
  @IsOptional()
  @IsUUID('4', { message: 'Invalid shiftTemplateId format' })
  shiftTemplateId?: string;

  @IsUUID('4', { message: 'Invalid plantId format' })
  @IsNotEmpty({ message: 'plantId is required' })
  plantId: string;

  // For template-based shifts, date is required if shiftTemplateId is provided
  @ValidateIf((o) => o.shiftTemplateId)
  @IsDateString(undefined, { message: 'date must be in YYYY-MM-DD format' })
  @IsNotEmpty({ message: 'date is required when using shiftTemplateId' })
  date?: string;

  // For custom shifts, startTime and endTime are required if shiftTemplateId is not provided
  @ValidateIf((o) => !o.shiftTemplateId)
  @IsDateString(undefined, { message: 'startTime must be in YYYY-MM-DDTHH:mm:ssZ format (24-hour)' })
  @IsNotEmpty({ message: 'startTime is required for custom shifts' })
  startTime?: string;

  @ValidateIf((o) => !o.shiftTemplateId)
  @IsDateString(undefined, { message: 'endTime must be in YYYY-MM-DDTHH:mm:ssZ format (24-hour)' })
  @IsNotEmpty({ message: 'endTime is required for custom shifts' })
  endTime?: string;

  // shiftTitle is optional; can inherit from template or provided for custom shifts
  @IsOptional()
  @IsString()
  shiftTitle?: string;
}
