import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// DTO for updating a user
export class UpdateUserDto extends PartialType(CreateUserDto) {}
