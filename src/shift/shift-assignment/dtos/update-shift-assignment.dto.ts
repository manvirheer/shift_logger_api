import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ValidationStatus } from '../entities/shift-assignment.entity';

export class UpdateShiftAssignmentDto {
  @IsOptional()
  @IsEnum(ValidationStatus)
  validationStatus?: ValidationStatus;

  @IsOptional()
  @IsUUID()
  validatedById?: string;
}
