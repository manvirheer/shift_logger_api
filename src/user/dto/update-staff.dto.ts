import { IsOptional, IsString } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';

// DTO for updating a staff user
export class UpdateStaffDto extends UpdateUserDto {
  @IsOptional()
  @IsString()
  a2pEmpId?: string;

  @IsOptional()
  @IsString()
  fatherName?: string;

  @IsOptional()
  @IsString()
  areaOfWork?: string;

  @IsOptional()
  @IsString()
  natureOfWork?: string;
}
