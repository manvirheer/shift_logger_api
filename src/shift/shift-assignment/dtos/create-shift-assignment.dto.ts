import { IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class CreateShiftAssignmentDto {
  @IsUUID()
  shiftScheduleId: string;

  @IsUUID()
  userId: string; // Staff member being assigned

  @IsOptional()
  @IsBoolean()
  requiresValidation?: boolean;
}
