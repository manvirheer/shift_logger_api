import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class CreateStaffDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  mobile: string;

  @IsString()
  emergencyContactName: string;

  @IsString()
  emergencyContactPhoneNumber: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  // Staff-specific fields
  @IsString()
  a2pEmpId: string;

  @IsString()
  fatherName: string;

  @IsString()
  areaOfWork: string;

  @IsString()
  natureOfWork: string;
}