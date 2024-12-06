import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

// DTO for creating a user
export class CreateUserDto {
  @IsString()
  @MinLength(4)
  username: string;
  
  @IsEmail()
  @IsOptional()
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
