import { IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

// DTO for creating a staff user
export class CreateStaffDto extends CreateUserDto {
  @IsString()
  a2pEmpId: string;

  @IsString()
  fatherName: string;

  @IsString()
  areaOfWork: string;

  @IsString()
  natureOfWork: string;
}
