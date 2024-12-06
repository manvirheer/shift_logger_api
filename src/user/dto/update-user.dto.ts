import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

// DTO for updating a user
export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsOptional()
    @IsString()
    @MinLength(4)
    username?: string;
}
