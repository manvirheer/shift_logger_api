import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhoneNumber?: string;

  @IsOptional()
  @IsString()
  password?: string;

  // Staff-specific fields (optional)
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
