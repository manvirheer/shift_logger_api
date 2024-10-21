import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class CreateAdminDto {
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
}
