import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

// DTO for creating a user
export class CreateUserDto {
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
