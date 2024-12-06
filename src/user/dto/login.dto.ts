import { IsEmail, IsString, MinLength } from 'class-validator';

// DTO for user login
export class LoginDto {
  @IsString()
  @MinLength(4)
  username: string;

  @IsString()
  password: string;
}
